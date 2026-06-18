package org.rsmod.client;

import java.applet.Applet;
import java.applet.AppletContext;
import java.applet.AudioClip;
import java.awt.Image;
import java.io.InputStream;
import java.net.URL;
import java.util.Collections;
import java.util.Enumeration;
import java.util.Iterator;
import java.util.Map;

import java.applet.AppletStub;

/**
 * Minimal {@link AppletStub} that feeds the gamepack its jav_config parameters and codebase.
 * A no-op {@link AppletContext} is supplied so calls like {@code showDocument} don't NPE.
 */
final class RsAppletStub implements AppletStub {

    private final Applet applet;
    private final Map<String, String> params;
    private final URL codeBase;

    RsAppletStub(Applet applet, Map<String, String> params, URL codeBase) {
        this.applet = applet;
        this.params = params;
        this.codeBase = codeBase;
    }

    @Override
    public boolean isActive() {
        return true;
    }

    @Override
    public URL getDocumentBase() {
        return codeBase;
    }

    @Override
    public URL getCodeBase() {
        return codeBase;
    }

    @Override
    public String getParameter(String name) {
        return params.get(name);
    }

    @Override
    public AppletContext getAppletContext() {
        return new AppletContext() {
            @Override public AudioClip getAudioClip(URL url) { return null; }
            @Override public Image getImage(URL url) { return null; }
            @Override public Applet getApplet(String name) { return null; }
            @Override public Enumeration<Applet> getApplets() { return Collections.emptyEnumeration(); }
            @Override public void showDocument(URL url) {}
            @Override public void showDocument(URL url, String target) {}
            @Override public void showStatus(String status) {}
            @Override public void setStream(String key, InputStream stream) {}
            @Override public InputStream getStream(String key) { return null; }
            @Override public Iterator<String> getStreamKeys() { return Collections.emptyIterator(); }
        };
    }

    @Override
    public void appletResize(int width, int height) {
        applet.setSize(width, height);
    }
}
