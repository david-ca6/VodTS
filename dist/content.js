let v={mode:"create"},n=null;function S(){const t=document.querySelector('.live-time span[aria-hidden="true"]');return t!=null&&t.textContent?x(t.textContent):null}function E(){const t=window.location.pathname.split("/");return t[1]==="video"||t[1]==="videos"}function T(){const t=window.location.href;if(t.includes("youtube.com")){const e=document.querySelector("video"),o=new URLSearchParams(window.location.search).get("v"),i=document.querySelector("h1.ytd-video-primary-info-renderer, h1.ytd-watch-metadata yt-formatted-string"),r=(i==null?void 0:i.textContent)||document.title.replace(" - YouTube","");if(e&&o)return{videoId:o,videoTitle:r,platform:"youtube",currentTime:e.currentTime}}if(t.includes("twitch.tv")){const e=document.querySelector("video"),o=window.location.pathname.split("/"),i=o[1],r=E(),d=r?o[2]:null,a=document.querySelector('[data-a-target="stream-title"], h2[data-a-target="stream-title"]'),c=(a==null?void 0:a.textContent)||document.title.replace(" - Twitch","");if(e){const u=r?e.currentTime:S()??e.currentTime;return{videoId:d||i,videoTitle:c,platform:"twitch",currentTime:u}}}return null}function _(){if(window.location.href.includes("twitch.tv")&&!E()){const o=S();if(o!==null)return o}const e=document.querySelector("video");return e?e.currentTime:null}function b(t){const e=Math.floor(t/3600),o=Math.floor(t%3600/60),i=Math.floor(t%60);return`${e.toString().padStart(2,"0")}:${o.toString().padStart(2,"0")}:${i.toString().padStart(2,"0")}`}function x(t){const e=t.split(":").map(o=>parseInt(o,10));return e.some(isNaN)?null:e.length===3?e[0]*3600+e[1]*60+e[2]:e.length===2?e[0]*60+e[1]:e.length===1?e[0]:null}function A(){return`${Date.now()}-${Math.random().toString(36).substr(2,9)}`}function M(){n&&n.remove(),n=document.createElement("div"),n.id="vodts-modal-container",document.body.appendChild(n),q()}function q(){if(!n)return;const{mode:t,timestamp:e,currentTime:o,videoInfo:i}=v,r=t==="edit",d=t==="endTime",a=r&&e?b(e.time):o!==void 0?b(o):"",c=r&&(e!=null&&e.endTime)?b(e.endTime):d&&o!==void 0?b(o):"",u=r&&e?e.text:"",p=r?"Edit Timestamp":d?"Add End Time":"New Timestamp",y=r?"Save":d?"Add End Time":"Create";n.innerHTML=`
        <style>
            #vodts-modal-overlay {
                position: fixed;
                inset: 0;
                background: rgba(0, 0, 0, 0.7);
                backdrop-filter: blur(4px);
                z-index: 999999;
                display: flex;
                align-items: center;
                justify-content: center;
                font-family: 'JetBrains Mono', 'Fira Code', monospace;
                animation: vodts-fade-in 0.15s ease-out;
            }

            @keyframes vodts-fade-in {
                from { opacity: 0; }
                to { opacity: 1; }
            }

            @keyframes vodts-slide-in {
                from { transform: translateY(-20px) scale(0.95); opacity: 0; }
                to { transform: translateY(0) scale(1); opacity: 1; }
            }

            #vodts-modal {
                background: #1a1a1a;
                border: 1px solid #2a2a2a;
                border-radius: 12px;
                width: 360px;
                padding: 20px;
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                animation: vodts-slide-in 0.2s ease-out;
            }

            #vodts-modal h2 {
                margin: 0 0 16px 0;
                font-size: 16px;
                font-weight: 600;
                color: #f0f0f0;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            #vodts-modal h2::before {
                content: '';
                width: 3px;
                height: 16px;
                background: linear-gradient(135deg, #ff4d4d, #ff8c4d);
                border-radius: 2px;
            }

            .vodts-input-group {
                margin-bottom: 14px;
            }

            .vodts-input-group label {
                display: block;
                font-size: 11px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                color: #888;
                margin-bottom: 6px;
            }

            .vodts-input-group input {
                width: 100%;
                padding: 10px 12px;
                background: #0f0f0f;
                border: 1px solid #2a2a2a;
                border-radius: 8px;
                color: #f0f0f0;
                font-size: 14px;
                font-family: inherit;
                transition: border-color 0.2s, box-shadow 0.2s;
                box-sizing: border-box;
            }

            .vodts-input-group input:focus {
                outline: none;
                border-color: #ff4d4d;
                box-shadow: 0 0 0 3px rgba(255, 77, 77, 0.15);
            }

            .vodts-input-group input::placeholder {
                color: #555;
            }

            .vodts-time-row {
                display: flex;
                gap: 10px;
            }

            .vodts-time-row .vodts-input-group {
                flex: 1;
            }

            .vodts-buttons {
                display: flex;
                gap: 10px;
                margin-top: 18px;
            }

            .vodts-btn {
                flex: 1;
                padding: 10px 16px;
                border: none;
                border-radius: 8px;
                font-size: 13px;
                font-weight: 500;
                font-family: inherit;
                cursor: pointer;
                transition: all 0.2s;
            }

            .vodts-btn-primary {
                background: linear-gradient(135deg, #ff4d4d, #ff6b6b);
                color: white;
            }

            .vodts-btn-primary:hover {
                background: linear-gradient(135deg, #ff6b6b, #ff8585);
                transform: translateY(-1px);
            }

            .vodts-btn-secondary {
                background: #2a2a2a;
                color: #888;
            }

            .vodts-btn-secondary:hover {
                background: #3a3a3a;
                color: #f0f0f0;
            }

            .vodts-hint {
                font-size: 10px;
                color: #555;
                margin-top: 12px;
                text-align: center;
            }
        </style>
        <div id="vodts-modal-overlay">
            <div id="vodts-modal">
                <h2>${p}</h2>

                ${d?"":`
                    <div class="vodts-input-group">
                        <label>Description</label>
                        <input type="text" id="vodts-text-input" placeholder="What's happening here?" value="${u}" autofocus>
                    </div>
                `}

                <div class="vodts-time-row">
                    ${d?"":`
                        <div class="vodts-input-group">
                            <label>Start Time</label>
                            <input type="text" id="vodts-time-input" placeholder="0:00" value="${a}">
                        </div>
                    `}
                    <div class="vodts-input-group">
                        <label>End Time ${d?"":"(optional)"}</label>
                        <input type="text" id="vodts-endtime-input" placeholder="0:00" value="${c}" ${d?"autofocus":""}>
                    </div>
                </div>

                <div class="vodts-buttons">
                    <button class="vodts-btn vodts-btn-secondary" id="vodts-cancel-btn">Cancel</button>
                    <button class="vodts-btn vodts-btn-primary" id="vodts-submit-btn">${y}</button>
                </div>

                <p class="vodts-hint">Press Escape to cancel • Enter to submit</p>
            </div>
        </div>
    `;const s=n.querySelector("#vodts-modal-overlay"),l=n.querySelector("#vodts-cancel-btn"),m=n.querySelector("#vodts-submit-btn"),g=n.querySelector("#vodts-text-input");n.querySelector("#vodts-time-input");const h=n.querySelector("#vodts-endtime-input");s==null||s.addEventListener("click",k=>{k.target===s&&f()}),l==null||l.addEventListener("click",f),m==null||m.addEventListener("click",C),document.addEventListener("keydown",I),setTimeout(()=>{d&&h?(h.focus(),h.select()):g&&g.focus()},50)}function I(t){t.key==="Escape"?f():t.key==="Enter"&&C()}function C(){const t=n==null?void 0:n.querySelector("#vodts-text-input"),e=n==null?void 0:n.querySelector("#vodts-time-input"),o=n==null?void 0:n.querySelector("#vodts-endtime-input"),{mode:i,timestamp:r,videoInfo:d}=v;if(i==="endTime"&&r){const s=(o==null?void 0:o.value.trim())||"",l=x(s);if(l!==null){const m={...r,endTime:l};chrome.runtime.sendMessage({type:"UPDATE_TIMESTAMP",payload:m})}f();return}const a=(t==null?void 0:t.value.trim())||"",c=(e==null?void 0:e.value.trim())||"",u=(o==null?void 0:o.value.trim())||"";if(!a||!c){t&&!a&&(t.style.borderColor="#ff4d4d"),e&&!c&&(e.style.borderColor="#ff4d4d");return}const p=x(c),y=u?x(u):void 0;if(p===null){e&&(e.style.borderColor="#ff4d4d");return}if(i==="edit"&&r){const s={...r,text:a,time:p,endTime:y??r.endTime};chrome.runtime.sendMessage({type:"UPDATE_TIMESTAMP",payload:s})}else if(d){const s={id:A(),text:a,time:p,endTime:y??void 0,videoId:d.videoId,videoTitle:d.videoTitle,platform:d.platform,createdAt:Date.now()};chrome.runtime.sendMessage({type:"SAVE_TIMESTAMP",payload:s})}f()}function f(){document.removeEventListener("keydown",I),n&&(n.remove(),n=null),v={isOpen:!1,mode:"create"}}function $(){const t=T();t&&(v={isOpen:!0,mode:"create",currentTime:t.currentTime,videoInfo:t},M())}const P=359999;async function D(){const t=T();if(!t)return;const i=((await chrome.storage.local.get("vodts_timestamps")).vodts_timestamps||[]).filter(a=>a.videoId===t.videoId&&a.endTime===P).sort((a,c)=>c.createdAt-a.createdAt)[0];if(!i){w("No open chapter to close");return}const r=Math.floor(t.currentTime),d={...i,endTime:r};chrome.runtime.sendMessage({type:"UPDATE_TIMESTAMP",payload:d}),w(`Closed chapter: ${i.text}`)}function z(t){const e=T();v={isOpen:!0,mode:"edit",timestamp:t,videoInfo:e||void 0},M()}function w(t){const e=document.createElement("div");e.style.cssText=`
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #1a1a1a;
        border: 1px solid #2a2a2a;
        color: #f0f0f0;
        padding: 12px 20px;
        border-radius: 8px;
        font-family: 'JetBrains Mono', monospace;
        font-size: 13px;
        z-index: 999999;
        animation: vodts-slide-up 0.3s ease-out;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
    `;const o=document.createElement("style");o.textContent=`
        @keyframes vodts-slide-up {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
    `,document.head.appendChild(o),e.textContent=t,document.body.appendChild(e),setTimeout(()=>{e.style.animation="vodts-slide-up 0.3s ease-out reverse",setTimeout(()=>{e.remove(),o.remove()},300)},2e3)}chrome.runtime.onMessage.addListener((t,e,o)=>{if(t.type==="GET_VIDEO_INFO"){const i=T();return o(i),!0}if(t.type==="GET_CURRENT_TIME"){const i=_();return o(i),!0}if(t.type==="CREATE_TIMESTAMP")return $(),o({success:!0}),!0;if(t.type==="ADD_END_TIME")return D(),o({success:!0}),!0;if(t.type==="EDIT_TIMESTAMP")return z(t.payload),o({success:!0}),!0;if(t.type==="SEEK_TO_TIME"){const i=document.querySelector("video");return i?(i.currentTime=t.payload.time,o({success:!0})):o({success:!1}),!0}return!1});console.log("VodTS content script loaded");
