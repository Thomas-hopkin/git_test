plugins {
    application
}

repositories {
    mavenCentral()
}

dependencies {
    // ASM is used to rewrite the gamepack's hard-coded RSA modulus.
    implementation("org.ow2.asm:asm:9.7")
}

java {
    // The rev-233 gamepack targets Java 11; run the launcher on the same.
    toolchain {
        languageVersion = JavaLanguageVersion.of(11)
    }
}

application {
    mainClass = "org.rsmod.client.Launcher"
}

tasks.named<JavaExec>("run") {
    // Allow `gradlew -p client run --args="path/to/osrs-233.jar"`.
    workingDir = rootProject.projectDir
}
