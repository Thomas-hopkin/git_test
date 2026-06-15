package org.rsmod.client;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Enumeration;
import java.util.List;
import java.util.jar.JarEntry;
import java.util.jar.JarFile;
import java.util.jar.JarOutputStream;
import java.util.regex.Pattern;

import org.objectweb.asm.ClassReader;
import org.objectweb.asm.ClassVisitor;
import org.objectweb.asm.ClassWriter;
import org.objectweb.asm.MethodVisitor;
import org.objectweb.asm.Opcodes;

/**
 * Rewrites the official OSRS gamepack so it talks to an RSMod server instead of Jagex.
 *
 * <p>The login handshake is RSA-encrypted with a modulus that is hard-coded into the
 * gamepack as a long hexadecimal string constant. Only Jagex holds the private key for
 * their modulus, so the client must be re-pointed at the server's own public modulus
 * (RSMod exports this during installation). We locate every sufficiently long hex string
 * constant in the bytecode and replace it with the server modulus.
 */
public final class GamepackPatcher {

    /** RSA moduli show up as long hex strings; nothing else in the client is this long. */
    private static final Pattern HEX = Pattern.compile("[0-9a-fA-F]{96,}");

    private GamepackPatcher() {}

    public static File patch(File input, File output, String serverModulus) throws IOException {
        List<String> replaced = new ArrayList<>();
        try (JarFile jar = new JarFile(input);
             JarOutputStream out = new JarOutputStream(new FileOutputStream(output))) {
            Enumeration<JarEntry> entries = jar.entries();
            while (entries.hasMoreElements()) {
                JarEntry entry = entries.nextElement();
                byte[] data = jar.getInputStream(entry).readAllBytes();
                if (entry.getName().endsWith(".class")) {
                    data = patchClass(data, serverModulus, replaced);
                }
                out.putNextEntry(new JarEntry(entry.getName()));
                out.write(data);
                out.closeEntry();
            }
        }
        System.out.println("[patcher] replaced " + replaced.size() + " hex constant(s) with the server modulus:");
        for (String s : replaced) {
            String preview = s.substring(0, Math.min(20, s.length()));
            System.out.println("  - " + preview + "... (" + s.length() + " hex chars)");
        }
        if (replaced.isEmpty()) {
            System.out.println("[patcher] WARNING: no modulus constant found — the gamepack may not be a clean OSRS jar.");
        }
        return output;
    }

    private static byte[] patchClass(byte[] data, String serverModulus, List<String> replaced) {
        ClassReader reader = new ClassReader(data);
        ClassWriter writer = new ClassWriter(0);
        ClassVisitor visitor = new ClassVisitor(Opcodes.ASM9, writer) {
            @Override
            public MethodVisitor visitMethod(int access, String name, String descriptor,
                                             String signature, String[] exceptions) {
                MethodVisitor mv = super.visitMethod(access, name, descriptor, signature, exceptions);
                return new MethodVisitor(Opcodes.ASM9, mv) {
                    @Override
                    public void visitLdcInsn(Object value) {
                        if (value instanceof String) {
                            String s = (String) value;
                            if (HEX.matcher(s).matches()) {
                                replaced.add(s);
                                super.visitLdcInsn(serverModulus);
                                return;
                            }
                        }
                        super.visitLdcInsn(value);
                    }
                };
            }
        };
        reader.accept(visitor, 0);
        return writer.toByteArray();
    }
}
