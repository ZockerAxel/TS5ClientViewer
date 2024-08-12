const customAppIdToggle = document.querySelector("#use_custom_id");
const customAppId = document.querySelector("#app_custom_id");

customAppIdToggle.addEventListener("input", toggleCustomAppId);

function toggleCustomAppId() {
    customAppId.disabled = !customAppIdToggle.checked;
}

const serverMode = document.querySelector("#server");
const serverName = document.querySelector("#server_name");
const serverList = document.querySelector("#server_list");

serverMode.addEventListener("change", toggleServerName);

function toggleServerName() {
    const serverNameChoosable = serverMode.value === "by_name";
    
    serverName.disabled = !serverNameChoosable;
    serverList.disabled = !serverNameChoosable;
}

serverList.addEventListener("change", selectServer);

function selectServer() {
    serverName.value = serverList.value;
}

const mode = document.querySelector("#mode");
const hideChannel = document.querySelector("#hide_channel");

mode.addEventListener("change", changeMode);

function changeMode() {
    const channelHideable = mode.value === "channel";
    
    hideChannel.disabled = !channelHideable;
}

const scaleSlider = document.querySelector("#scale_slider");
const scale = document.querySelector("#scale");

scaleSlider.addEventListener("input", changeScaleSlider);

function changeScaleSlider() {
    scale.value = scaleSlider.value;
}

scale.addEventListener("input", changeScale);

function changeScale() {
    scaleSlider.value = `${Math.max(0, Math.min(4, Number.parseFloat(scale.value)))}`;
}