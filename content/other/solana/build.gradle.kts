plugins {
    id("base-conventions")
}

dependencies {
    implementation(libs.okhttp)
    implementation(libs.jackson.databind)
    implementation(projects.api.pluginCommons)
}
