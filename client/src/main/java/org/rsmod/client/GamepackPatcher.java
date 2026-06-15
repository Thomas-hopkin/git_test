package org.rsmod.client;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Enumeration;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.jar.Attributes;
import java.util.jar.JarEntry;
import java.util.jar.JarFile;
import java.util.jar.JarOutputStream;
import java.util.jar.Manifest;
import java.util.regex.Pattern;

import org.objectweb.asm.ClassReader;
import org.objectweb.asm.ClassVisitor;
import org.objectweb.asm.ClassWriter;
import org.objectweb.asm.MethodVisitor;
import org.objectweb.asm.Opcodes;

/**
 * Rewrites the official OSRS gamepack so it talks to an RSMod server instead of Jagex.
 *
 * <p>Two things have to happen:
 * <ol>
 *   <li>The gamepack is a <b>signed</b> jar. Modifying any class invalidates the signature,
 *       so the signing artifacts (META-INF/*.SF, *.RSA, *.DSA, *.EC) and the per-entry
 *       manifest digests are stripped; otherwise the JVM throws a SHA-256 digest error.</li>
 *   <li>The login handshake is RSA-encrypted with a modulus hard-coded into the gamepack as
 *       a long hex string. Only Jagex holds the private key for theirs, so it is replaced
 *       with the server's own public modulus. The login modulus is the <b>longest</b> hex
 *       constant in the client (a 1024-bit modulus dwarfs the elliptic-curve params), so we
 *       target that one and log every candidate for verification.</li>
 * </ol>
 */
public final class GamepackPatcher {

    /** RSA moduli show up as long hex strings; the shorter ones are curve params / hashes. */
    private static final Pattern HEX = Pattern.compile("[0-9a-fA-F]{100,}");

    private GamepackPatcher() {}

    public static File patch(File input, File output, String serverModulus) throws IOException {
        // Pass 1: collect every long hex constant so we can pick (and log) the login modulus.
        List<String> candidates = new ArrayList<>();
        try (JarFile jar = new JarFile(input, false)) {
            Enumeration<JarEntry> entries = jar.entries();
            while (entries.hasMoreElements()) {
                JarEntry entry = entries.nextElement();
                if (entry.getName().endsWith(".class")) {
                    collect(jar.getInputStream(entry).readAllBytes(), candidates);
                }
            }
        }
        Set<String> unique = new LinkedHashSet<>(candidates);
        String target = null;
        System.out.println("[patcher] long hex constants found (len : prefix):");
        for (String s : unique) {
            System.out.println(String.format("  %4d : %s...", s.length(), s.substring(0, Math.min(48, s.length()))));
            if (target == null || s.length() > target.length()) {
                target = s;
            }
        }
        if (target == null) {
            System.out.println("[patcher] WARNING: no modulus-like constant found.");
        } else {
            System.out.println("[patcher] -> replacing LONGEST (" + target.length()
                + " chars) with server modulus (" + serverModulus.length() + " chars).");
        }

        // Pass 2: rewrite, dropping signing artifacts and swapping the target constant.
        Manifest manifest = new Manifest();
        manifest.getMainAttributes().put(Attributes.Name.MANIFEST_VERSION, "1.0");
        try (JarFile jar = new JarFile(input, false);
             JarOutputStream out = new JarOutputStream(new FileOutputStream(output), manifest)) {
            Enumeration<JarEntry> entries = jar.entries();
            while (entries.hasMoreElements()) {
                JarEntry entry = entries.nextElement();
                String name = entry.getName();
                if (isSigningArtifact(name)) {
                    continue;
                }
                byte[] data = jar.getInputStream(entry).readAllBytes();
                if (name.endsWith(".class") && target != null) {
                    data = replace(data, target, serverModulus);
                }
                out.putNextEntry(new JarEntry(name));
                out.write(data);
                out.closeEntry();
            }
        }
        return output;
    }

    private static boolean isSigningArtifact(String name) {
        if (name.equalsIgnoreCase("META-INF/MANIFEST.MF")) {
            return true;
        }
        String upper = name.toUpperCase();
        return upper.startsWith("META-INF/")
            && (upper.endsWith(".SF") || upper.endsWith(".RSA")
                || upper.endsWith(".DSA") || upper.endsWith(".EC"));
    }

    private static void collect(byte[] data, List<String> out) {
        new ClassReader(data).accept(new ClassVisitor(Opcodes.ASM9) {
            @Override
            public MethodVisitor visitMethod(int a, String n, String d, String s, String[] e) {
                return new MethodVisitor(Opcodes.ASM9) {
                    @Override
                    public void visitLdcInsn(Object value) {
                        if (value instanceof String && HEX.matcher((String) value).matches()) {
                            out.add((String) value);
                        }
                    }
                };
            }
        }, 0);
    }

    private static byte[] replace(byte[] data, String from, String to) {
        ClassReader reader = new ClassReader(data);
        ClassWriter writer = new ClassWriter(0);
        reader.accept(new ClassVisitor(Opcodes.ASM9, writer) {
            @Override
            public MethodVisitor visitMethod(int a, String n, String d, String s, String[] e) {
                MethodVisitor mv = super.visitMethod(a, n, d, s, e);
                return new MethodVisitor(Opcodes.ASM9, mv) {
                    @Override
                    public void visitLdcInsn(Object value) {
                        super.visitLdcInsn(from.equals(value) ? to : value);
                    }
                };
            }
        }, 0);
        return writer.toByteArray();
    }
}
