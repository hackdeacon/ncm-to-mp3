window.URL = window.webkitURL || window.URL;

function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function featureAvailable() {
	let res = "";
	if (!document.querySelector) res += "浏览器不支持页面元素选择功能。";
	if (!window.FileReader) res += "浏览器不支持本地文件读取。";
	if (!window.URL) res += "浏览器不支持本地数据生成URL功能。";
	if (!("download" in document.createElement("a"))) res += "浏览器不支持下载。";
	if (!(document.createElement('canvas').getContext instanceof Function)) res += "浏览器不支持HTML5。";
	if (typeof WebAssembly === "undefined") res += "浏览器不支持WebAssembly。";
	if (typeof TextDecoder === "undefined") res += "浏览器不支持文字解码。";
	if (typeof Promise === "undefined") res += "浏览器不支持Promise。";
	try {
		new Blob(['foo'], { type: 'text/plain' });
	} catch (e) {
		res += "浏览器不支持二进制大对象操作。";
	}
	return res;
}

function checkBrowser() {
	const reason = featureAvailable();
	if (reason) {
		const div = document.createElement("div");
		div.id = "may-not-work-container";
		div.className = "alert alert-warning";
		div.innerHTML = `<strong>提示：</strong> 您的浏览器可能不能使用本站功能，请下载最新浏览器或更新系统后重试，原因：<strong>${reason}</strong>`;
		document.getElementById("site-index")?.appendChild(div);
	}
}

function updateDownloadAllStatus() {
	const hasItem = [...document.getElementById("res-tbody").children].some(el => el.nodeType === 1);
	document.getElementById('download-all-btn-container').style.visibility = hasItem ? "visible" : "hidden";
}

function releaseMemory(element) {
	const newElement = element.cloneNode(false); // false = 不克隆子节点
	element.parentNode.replaceChild(newElement, element);

	if (newElement.tagName === 'IMG' || newElement.tagName === 'VIDEO') {
		newElement.src = '';
	}

	while (newElement.firstChild) {
		releaseMemory(newElement.firstChild);
		newElement.removeChild(newElement.firstChild);
	}
}

function removeElementByID(id) {
	const element = document.getElementById(id);
	if (element && element.parentNode) {
		// Clean up canvas and blob URLs before removing
		const canvas = element.querySelector('canvas');
		if (canvas) {
			const ctx = canvas.getContext('2d');
			ctx.clearRect(0, 0, canvas.width, canvas.height);
		}
		// Revoke blob URL
		if (element._blobUrl) {
			URL.revokeObjectURL(element._blobUrl);
		}
		element.remove();
	}
	updateDownloadAllStatus();
}

function createListItem(res) {
	const blobUrl = URL.createObjectURL(res.blob);
	const fileName = `${res.rawFilename}.${res.ext}`;
	const randID = Math.random().toString(36).substr(2, 16);

	// Create file item structure
	const li = document.createElement("li");
	li.className = 'file-item';
	li.id = randID;

	// File icon with album art
	const iconDiv = document.createElement("div");
	iconDiv.className = 'file-icon';
	const canvas = document.createElement("canvas");
	canvas.width = 80;
	canvas.height = 80;
	iconDiv.appendChild(canvas);

	const img = new Image();
	img.onload = () => {
		URL.revokeObjectURL(img.src);
		canvas.getContext("2d").drawImage(img, 0, 0, 80, 80);
	};
	img.src = res.picture || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"%3E%3Cpath fill="%23BDBDBD" d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/%3E%3C/svg%3E';

	// File info section
	const infoDiv = document.createElement("div");
	infoDiv.className = 'file-info';

	const nameDiv = document.createElement("div");
	nameDiv.className = 'file-name';
	nameDiv.textContent = fileName;

	const metaDiv = document.createElement("div");
	metaDiv.className = 'file-meta';
	metaDiv.textContent = formatFileSize(res.blob.size);

	infoDiv.appendChild(nameDiv);
	infoDiv.appendChild(metaDiv);

	// File status section
	const statusDiv = document.createElement("div");
	statusDiv.className = 'file-status success';
	statusDiv.innerHTML = `
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;">
			<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
			<polyline points="22 4 12 14.01 9 11.01"/>
		</svg>
		<span>Ready</span>
	`;

	// File actions section
	const actionsDiv = document.createElement("div");
	actionsDiv.className = 'file-actions';

	// Play button
	const playBtn = document.createElement("button");
	playBtn.type = "button";
	playBtn.className = 'btn btn-icon';
	playBtn.title = "Preview";
	playBtn.innerHTML = `
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
			<polygon points="5 3 19 12 5 21 5 3"/>
		</svg>
	`;
	playBtn.onclick = () => {
		const audioModal = document.getElementById('audio-modal');
		const audioPlayer = document.getElementById('audio-player');
		const audioTitle = document.getElementById('audio-title');

		audioPlayer.src = blobUrl;
		audioTitle.textContent = fileName;
		audioModal.style.display = 'flex';
		audioPlayer.play();
	};

	// Download button
	const downloadBtn = document.createElement("a");
	downloadBtn.href = blobUrl;
	downloadBtn.className = 'btn btn-icon';
	downloadBtn.download = fileName;
	downloadBtn.onclick = downloadClicked;
	downloadBtn.innerHTML = `
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
			<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
			<polyline points="7 10 12 15 17 10"/>
			<line x1="12" y1="15" x2="12" y2="3"/>
		</svg>
	`;
	downloadBtn.title = "Download";

	// Delete button
	const deleteBtn = document.createElement("button");
	deleteBtn.type = "button";
	deleteBtn.className = 'btn btn-icon';
	deleteBtn.onclick = () => removeElementByID(randID);
	deleteBtn.innerHTML = `
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
			<polyline points="3 6 5 6 21 6"/>
			<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
		</svg>
	`;
	deleteBtn.title = "Delete";

	// Add download link class for batch download
	downloadBtn.classList.add('result-download-link');

	actionsDiv.appendChild(playBtn);
	actionsDiv.appendChild(downloadBtn);
	actionsDiv.appendChild(deleteBtn);

	// Assemble the item
	li.appendChild(iconDiv);
	li.appendChild(infoDiv);
	li.appendChild(statusDiv);
	li.appendChild(actionsDiv);

	// Store blob URL for cleanup on removal
	li._blobUrl = blobUrl;

	document.getElementById("res-tbody").appendChild(li);
	updateDownloadAllStatus();
}

function handleFileSelect(evt) {
	const files = evt.target.files;
	const fileNames = Array.from(files).map(f => f.name).join("|");

	for (const file of files) {
		const reader = new FileReader();
		reader.onloadend = () => {
			decrypt.Decrypt(file).then(createListItem);
		};
		reader.readAsArrayBuffer(file);
	}

	// $.ajax({ type: "GET", url: "/site/log", data: fileNames });
}

function showDownloaded() {
	const randID = Math.random().toString(36).substr(2, 16);
	const div = document.createElement("div");
	div.id = `status-downloaded-${randID}`;
	div.className = "status-downloaded";
	div.innerText = "已为您下载，请到下载文件夹查看";
	document.body.appendChild(div);
	$(`#${div.id}`).animate({ height: 200, opacity: 'toggle' }, 2000, () => div.remove());
}

function setCookie(name, value, days) {
	const d = new Date();
	d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
	document.cookie = `${name}=${value};expires=${d.toUTCString()};path=/`;
}

function getCookie(name) {
	const cookies = document.cookie.split(';').map(c => c.trim());
	for (const c of cookies) {
		if (c.startsWith(`${name}=`)) return c.substring(name.length + 1);
	}
	return "";
}

let showed = false;
let downloadTriggered = false;

function downloadClicked() {
	if (!showed && getCookie("donated") === "") {
		// 你可以根据需要打开弹窗 overlayForceOn();
		downloadTriggered = true;
	} else {
		showDownloaded();
	}
}

function overlayOff() {
	document.getElementById("overlay").style.display = "none";
	setCookie("donated", "true", 30);
	showed = true;
	if (downloadTriggered) {
		downloadTriggered = false;
		showDownloaded();
	}
}

function refreshMPAnnimation() {
	const disabled = getCookie("disable_annimation_mp") === "true";
	document.getElementById("toggle-mp-annimation-text").innerText = disabled ? "开启公众号加载动画" : "关闭公众号加载动画";
}

function toggleMPAnnimation() {
	const disabled = getCookie("disable_annimation_mp") === "true";
	setCookie("disable_annimation_mp", disabled ? "false" : "true", 10086);
	refreshMPAnnimation();
}