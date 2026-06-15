package org.rsmod.client;

import java.applet.Applet;
import java.awt.BorderLayout;
import java.awt.Frame;
import java.awt.event.WindowAdapter;
import java.awt.event.WindowEvent;
import java.io.File;
import java.net.URL;
import java.net.URLClassLoader;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Standalone player launcher for the RSMod PvP server.
 *
 * <p>Loads the frozen rev-233 OSRS gamepack, rewrites its RSA modulus to the server's
 * (see {@link GamepackPatcher}), feeds it the rev-233 applet parameters with our overrides,
 * and opens the client window. The game cache is downloaded from the server over JS5 on
 * first connect, so nothing else needs to ship with the client.
 *
 * <p>Usage: {@code gradlew -p client run --args="osrs-233.jar"}
 */
public final class Launcher {

    // --- RSMod server connection (edit these for a public server later) -------------------
    /** RSMod's RSA modulus, exported during server installation. Must match the server. */
    static final String RSA_MODULUS =
        "bd7bc24d6bbcf0de2525fc75678fc47e89d1173919ff5cda37ff99dca5f7054804cc90c6166e23021f10"
        + "d2da939f60432675ca46edf44a8dee0c6d59ddd747405f40280ea21b63eb5bd3d31497ea219bec171918"
        + "374f2915ddf0958341b6ef7fdb00453183";
    /** Where the client fetches the server list (slr.ws). Served by the bridge. */
    static final String WORLDLIST_URL = "http://127.0.0.1:4567/worldlist.ws";
    /** Applet codebase. Not used for cache (JS5 handles that) but must be a valid URL. */
    static final String CODEBASE = "http://127.0.0.1/";

    private Launcher() {}

    public static void main(String[] args) throws Exception {
        File gamepack = new File(args.length > 0 ? args[0] : "osrs-233.jar");
        if (!gamepack.isFile()) {
            System.err.println("Gamepack not found: " + gamepack.getAbsolutePath());
            System.err.println("Download osrs-233.jar from https://github.com/runetech/osrs-gamepacks");
            System.err.println("and pass its path, e.g. gradlew -p client run --args=\"C:/path/osrs-233.jar\"");
            System.exit(1);
        }

        File patched = new File(gamepack.getAbsoluteFile().getParentFile(), "gamepack-patched.jar");
        GamepackPatcher.patch(gamepack, patched, RSA_MODULUS);

        URLClassLoader loader = new URLClassLoader(
            new URL[] { patched.toURI().toURL() }, Launcher.class.getClassLoader());
        Class<?> clientClass = loader.loadClass("client");
        Applet applet = (Applet) clientClass.getDeclaredConstructor().newInstance();
        applet.setStub(new RsAppletStub(applet, javConfigParams(), new URL(CODEBASE)));

        Frame frame = new Frame("RSMod PvP");
        frame.setLayout(new BorderLayout());
        frame.add(applet, BorderLayout.CENTER);
        frame.setSize(800, 600);
        frame.setLocationRelativeTo(null);
        frame.addWindowListener(new WindowAdapter() {
            @Override
            public void windowClosing(WindowEvent e) {
                System.exit(0);
            }
        });
        frame.setVisible(true);

        applet.setSize(800, 600);
        applet.init();
        applet.start();
    }

    /**
     * The full rev-233 applet parameter set (from jav_config_233.ws), with our overrides.
     * The client dereferences these during init; a missing one causes a NullPointerException,
     * which is exactly what broke the earlier proxy attempt.
     */
    private static Map<String, String> javConfigParams() {
        Map<String, String> p = new LinkedHashMap<>();
        p.put("2", "https://payments.jagex.com/");
        p.put("3", "true");
        p.put("4", "1");
        p.put("5", "1");
        p.put("6", "0");
        p.put("7", "0");
        p.put("8", "true");
        p.put("9", "ElZAIrq5NpKN6D3mDdihco3oPeYN2KFy2DCquj7JMmECPmLrDP3Bnw");
        p.put("10", "5");
        p.put("11", "https://auth.jagex.com/");
        p.put("12", "305");
        p.put("13", ".runescape.com");
        p.put("14", "0");
        p.put("15", "0");
        p.put("16", "false");
        p.put("17", WORLDLIST_URL);   // server list -> our worldlist
        p.put("18", "");
        p.put("19", "196515767263-1oo20deqm6edn7ujlihl6rpadk9drhva.apps.googleusercontent.com");
        p.put("20", "https://social.auth.jagex.com/");
        p.put("21", "0");
        p.put("22", "https://auth.runescape.com/");
        p.put("25", "233");           // revision
        p.put("28", "https://account.jagex.com/");
        return p;
    }
}
