let f={mode:"create"},i=null;function M(){const t=document.querySelector('.live-time span[aria-hidden="true"]');return t!=null&&t.textContent?x(t.textContent):null}function I(){const t=window.location.pathname.split("/");return t[1]==="video"||t[1]==="videos"}function T(){const t=window.location.href;if(t.includes("youtube.com")){const e=document.querySelector("video"),o=new URLSearchParams(window.location.search).get("v"),n=document.querySelector("h1.ytd-video-primary-info-renderer, h1.ytd-watch-metadata yt-formatted-string"),d=(n==null?void 0:n.textContent)||document.title.replace(" - YouTube","");if(e&&o)return{videoId:o,videoTitle:d,platform:"youtube",currentTime:e.currentTime}}if(t.includes("twitch.tv")){const e=document.querySelector("video"),o=window.location.pathname.split("/"),n=o[1],d=I(),r=d?o[2]:null,a=document.querySelector('[data-a-target="stream-title"], h2[data-a-target="stream-title"]'),s=(a==null?void 0:a.textContent)||document.title.replace(" - Twitch","");if(e){const u=d?e.currentTime:M()??e.currentTime;return{videoId:r||n,videoTitle:s,platform:"twitch",currentTime:u}}}return null}function q(){if(window.location.href.includes("twitch.tv")&&!I()){const o=M();if(o!==null)return o}const e=document.querySelector("video");return e?e.currentTime:null}function y(t){const e=Math.floor(t/3600),o=Math.floor(t%3600/60),n=Math.floor(t%60);return`${e.toString().padStart(2,"0")}:${o.toString().padStart(2,"0")}:${n.toString().padStart(2,"0")}`}function x(t){const e=t.split(":").map(o=>parseInt(o,10));return e.some(isNaN)?null:e.length===3?e[0]*3600+e[1]*60+e[2]:e.length===2?e[0]*60+e[1]:e.length===1?e[0]:null}function $(){return`${Date.now()}-${Math.random().toString(36).substr(2,9)}`}function C(){i&&i.remove(),i=document.createElement("div"),i.id="vodts-modal-container",document.body.appendChild(i),D()}function D(){if(!i)return;const{mode:t,timestamp:e,currentTime:o,videoInfo:n}=f,d=t==="edit",r=t==="endTime",a=d&&e?y(e.time):o!==void 0?y(o):"",s=d&&(e!=null&&e.endTime)?y(e.endTime):r&&o!==void 0?y(o):"",u=d&&e?e.text:"",h=d?"Edit Timestamp":r?"Add End Time":"New Timestamp",m=d?"Save":r?"Add End Time":"Create";i.innerHTML=`
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

            .vodts-btn-chapter {
                background: linear-gradient(135deg, #ff8c4d, #ffaa4d);
                color: white;
            }

            .vodts-btn-chapter:hover {
                background: linear-gradient(135deg, #ffaa4d, #ffbb6b);
                transform: translateY(-1px);
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
                <h2>${h}</h2>

                ${r?"":`
                    <div class="vodts-input-group">
                        <label>Description</label>
                        <input type="text" id="vodts-text-input" placeholder="What's happening here?" value="${u}" autofocus>
                    </div>
                `}

                <div class="vodts-time-row">
                    ${r?"":`
                        <div class="vodts-input-group">
                            <label>Start Time</label>
                            <input type="text" id="vodts-time-input" placeholder="0:00" value="${a}">
                        </div>
                    `}
                    <div class="vodts-input-group">
                        <label>End Time ${r?"":"(optional)"}</label>
                        <input type="text" id="vodts-endtime-input" placeholder="0:00" value="${s}" ${r?"autofocus":""}>
                    </div>
                </div>

                <div class="vodts-buttons">
                    <button class="vodts-btn vodts-btn-secondary" id="vodts-cancel-btn">Cancel</button>
                    ${t==="create"?'<button class="vodts-btn vodts-btn-chapter" id="vodts-chapter-btn">Chapter</button>':""}
                    <button class="vodts-btn vodts-btn-primary" id="vodts-submit-btn">${m}</button>
                </div>

                <p class="vodts-hint">Escape to cancel${t==="create"?" • Shift+Enter for chapter":""} • Enter to submit</p>
            </div>
        </div>
    `;const p=i.querySelector("#vodts-modal-overlay"),c=i.querySelector("#vodts-cancel-btn"),l=i.querySelector("#vodts-submit-btn"),v=i.querySelector("#vodts-chapter-btn"),S=i.querySelector("#vodts-text-input");i.querySelector("#vodts-time-input");const g=i.querySelector("#vodts-endtime-input");p==null||p.addEventListener("click",A=>{A.target===p&&b()}),c==null||c.addEventListener("click",b),l==null||l.addEventListener("click",()=>w(!1)),v==null||v.addEventListener("click",()=>w(!0)),document.addEventListener("keydown",k),setTimeout(()=>{r&&g?(g.focus(),g.select()):S&&S.focus()},50)}function k(t){if(t.key==="Escape")b();else if(t.key==="Enter"){t.preventDefault();const e=t.shiftKey&&f.mode==="create";w(e)}}function w(t=!1){const e=i==null?void 0:i.querySelector("#vodts-text-input"),o=i==null?void 0:i.querySelector("#vodts-time-input"),n=i==null?void 0:i.querySelector("#vodts-endtime-input"),{mode:d,timestamp:r,videoInfo:a}=f;if(d==="endTime"&&r){const c=(n==null?void 0:n.value.trim())||"",l=x(c);if(l!==null){const v={...r,endTime:l};chrome.runtime.sendMessage({type:"UPDATE_TIMESTAMP",payload:v})}b();return}const s=(e==null?void 0:e.value.trim())||"",u=(o==null?void 0:o.value.trim())||"",h=(n==null?void 0:n.value.trim())||"";if(!s||!u){e&&!s&&(e.style.borderColor="#ff4d4d"),o&&!u&&(o.style.borderColor="#ff4d4d");return}const m=x(u),p=h?x(h):void 0;if(m===null){o&&(o.style.borderColor="#ff4d4d");return}if(d==="edit"&&r){const c={...r,text:s,time:m,endTime:p??r.endTime};chrome.runtime.sendMessage({type:"UPDATE_TIMESTAMP",payload:c})}else if(a){const c=t?_:p??void 0,l={id:$(),text:s,time:m,endTime:c,videoId:a.videoId,videoTitle:a.videoTitle,platform:a.platform,createdAt:Date.now()};chrome.runtime.sendMessage({type:"SAVE_TIMESTAMP",payload:l})}b()}function b(){document.removeEventListener("keydown",k),i&&(i.remove(),i=null),f={isOpen:!1,mode:"create"}}function P(){const t=T();t&&(f={isOpen:!0,mode:"create",currentTime:t.currentTime,videoInfo:t},C())}const _=359999;async function L(){const t=T();if(!t)return;const n=((await chrome.storage.local.get("vodts_timestamps")).vodts_timestamps||[]).filter(a=>a.videoId===t.videoId&&a.endTime===_).sort((a,s)=>s.createdAt-a.createdAt)[0];if(!n){E("No open chapter to close");return}const d=Math.floor(t.currentTime),r={...n,endTime:d};chrome.runtime.sendMessage({type:"UPDATE_TIMESTAMP",payload:r}),E(`Closed chapter: ${n.text}`)}function z(t){const e=T();f={isOpen:!0,mode:"edit",timestamp:t,videoInfo:e||void 0},C()}function E(t){const e=document.createElement("div");e.style.cssText=`
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
    `,document.head.appendChild(o),e.textContent=t,document.body.appendChild(e),setTimeout(()=>{e.style.animation="vodts-slide-up 0.3s ease-out reverse",setTimeout(()=>{e.remove(),o.remove()},300)},2e3)}chrome.runtime.onMessage.addListener((t,e,o)=>{if(t.type==="GET_VIDEO_INFO"){const n=T();return o(n),!0}if(t.type==="GET_CURRENT_TIME"){const n=q();return o(n),!0}if(t.type==="CREATE_TIMESTAMP")return P(),o({success:!0}),!0;if(t.type==="ADD_END_TIME")return L(),o({success:!0}),!0;if(t.type==="EDIT_TIMESTAMP")return z(t.payload),o({success:!0}),!0;if(t.type==="SEEK_TO_TIME"){const n=document.querySelector("video");return n?(n.currentTime=t.payload.time,o({success:!0})):o({success:!1}),!0}return!1});console.log("VodTS content script loaded");
