/* ============================================================
   Grain-128 Cipher — 8-Bit Step-by-Step Manual Calculation Engine
   ============================================================ */

// 1. Initial State Seeds
const LFSR_HEX = "ACE123456789ABCDEF0123456789ABCE";
const NFSR_HEX = "123456789ABCDEF0123456789ABCDEF0";

// Helpers
function hexToBits(h) {
    let b = [];
    for (let c of h) { let v = parseInt(c, 16); for (let i = 3; i >= 0; i--) b.push((v >> i) & 1); }
    return b;
}
function getBit(bits, idx) { return bits[127 - idx]; }
function esc(t) { let d = document.createElement('div'); d.textContent = t; return d.innerHTML; }

// Engine
function lfsrFb(L) {
    return getBit(L,127)^getBit(L,120)^getBit(L,89)^getBit(L,57)^getBit(L,46)^getBit(L,31);
}

function nfsrFb(L, N) {
    return getBit(L,127)^getBit(N,127)^getBit(N,101)^getBit(N,71)^getBit(N,36)^getBit(N,31)
        ^(getBit(N,124)&getBit(N,60))^(getBit(N,116)&getBit(N,114))^(getBit(N,110)&getBit(N,109))
        ^(getBit(N,100)&getBit(N,68))^(getBit(N,87)&getBit(N,79))^(getBit(N,66)&getBit(N,62))
        ^(getBit(N,59)&getBit(N,43));
}

function zBitDetailed(L, N) {
    let s124=getBit(L,124),s102=getBit(L,102),s81=getBit(L,81),s63=getBit(L,63),s57=getBit(L,57);
    let b118=getBit(N,118),b87=getBit(N,87),b79=getBit(N,79),b39=getBit(N,39);
    let t1=s124&s102, t2=s81&s63, t3=s57&b118, t4=b87&b79, t5=s124&s57&b39;
    let h=t1^t2^t3^t4^t5;
    let s34=getBit(L,34),b125=getBit(N,125),b112=getBit(N,112),b91=getBit(N,91);
    let b82=getBit(N,82),b63n=getBit(N,63),b54=getBit(N,54),b38=getBit(N,38);
    let lin=s34^b125^b112^b91^b82^b63n^b54^b38;
    return {s124,s102,s81,s63,s57,b118,b87,b79,b39,t1,t2,t3,t4,t5,h,s34,b125,b112,b91,b82,b63n,b54,b38,lin,z:h^lin};
}

function step8(L, N) {
    let cL=[...L], cN=[...N], zBits=[], dets=[];
    for (let s=0; s<8; s++) {
        let d = zBitDetailed(cL, cN);
        zBits.push(d.z); dets.push(d);
        let lf=lfsrFb(cL), nf=nfsrFb(cL, cN);
        cL=cL.slice(1); cL.push(lf);
        cN=cN.slice(1); cN.push(nf);
    }
    let zB=0; for (let b of zBits) zB=(zB<<1)|b;
    return {zByte:zB, zBits, dets};
}

// Global State for 1 character calculation
let curStep = 1;
let currentChar = 'H';
let pByte = 72;
let zByte = 0x80;
let zBits = [1,0,0,0,0,0,0,0];
let cByte = 0xC8;
let pDecByte = 72;
let detS0 = {};
let allDets = [];
let selectedStep4BitIndex = 0; // 0 = Z[7] (S0), 7 = Z[0] (S7)

function calculateSingleChar(ch) {
    currentChar = ch || 'H';
    pByte = currentChar.charCodeAt(0) & 0xFF;
    
    let L = hexToBits(LFSR_HEX);
    let N = hexToBits(NFSR_HEX);
    let res = step8(L, N);
    
    zByte = res.zByte;
    zBits = res.zBits;
    detS0 = res.dets[0];
    allDets = res.dets;
    
    cByte = pByte ^ zByte;
    pDecByte = cByte ^ zByte;
}

const STEP_LABELS = ['','1. Input','2. Binary','3. Taps','4. h(x) & Z','5. Encrypt','6. Cipher','7. Decrypt'];

function buildProgressBar() {
    let bar = document.getElementById('progress-bar');
    bar.innerHTML = '';
    for (let i=1; i<=7; i++) {
        if (i > 1) {
            let conn = document.createElement('div');
            conn.className = `prog-connector ${i <= curStep ? 'filled' : ''}`;
            bar.appendChild(conn);
        }
        let step = document.createElement('div');
        step.className = `prog-step ${i === curStep ? 'active' : ''} ${i < curStep ? 'done' : ''}`;
        step.onclick = () => goToStep(i);
        step.innerHTML = `<div class="prog-dot">${i < curStep ? '✓' : i}</div><span class="prog-label">${STEP_LABELS[i]}</span>`;
        bar.appendChild(step);
    }
}

function goToStep(n) {
    curStep = n;
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    let page = document.getElementById(`page-${n}`);
    if (page) page.classList.add('active');
    document.getElementById('page-container').scrollTop = 0;
    buildProgressBar();
    renderPage(n);
    triggerReveals(n);
}

function triggerReveals(stepNum) {
    let page = document.getElementById(`page-${stepNum}`);
    if (!page) return;

    let items = page.querySelectorAll('.reveal-item');
    items.forEach((el) => {
        el.classList.add('revealed');
    });
}

function renderPage(n) {
    switch(n) {
        case 1: renderP1(); break;
        case 2: renderP2(); break;
        case 3: renderP3(); break;
        case 4: renderP4(); break;
        case 5: renderP5(); break;
        case 6: renderP6(); break;
        case 7: renderP7(); break;
    }
}

// Step 1
function renderP1() {
    let hex = pByte.toString(16).padStart(2,'0').toUpperCase();
    let bin = pByte.toString(2).padStart(8,'0');
    document.getElementById('char-summary-title').innerText = `Character '${currentChar}'`;
    document.getElementById('char-summary-sub').innerText = `ASCII: ${pByte} | Hex: 0x${hex} | Binary: ${bin}`;
}

// Step 2
function renderP2() {
    let hex = pByte.toString(16).padStart(2,'0').toUpperCase();
    let bin = pByte.toString(2).padStart(8,'0');
    
    document.getElementById('step2-char-name').innerText = `'${currentChar}'`;
    document.getElementById('step2-ascii').innerText = pByte;
    document.getElementById('step2-hex').innerText = `0x${hex}`;
    document.getElementById('step2-bin').innerText = bin;
    
    let row = document.getElementById('step2-table-row');
    let html = `<td>Value</td>`;
    for (let b=7; b>=0; b--) {
        let v = (pByte >> b) & 1;
        html += `<td class="${v ? 'b1' : 'b0'}">${v}</td>`;
    }
    row.innerHTML = html;
}

// Step 3
function renderP3() {
    let d = detS0;
    document.getElementById('lfsr-tap-list').innerText = 
        `s124 = ${d.s124} | s102 = ${d.s102} | s81 = ${d.s81} | s63 = ${d.s63} | s57 = ${d.s57} | s34 = ${d.s34}`;
    document.getElementById('nfsr-tap-list').innerText = 
        `b125 = ${d.b125} | b118 = ${d.b118} | b112 = ${d.b112} | b91 = ${d.b91} | b87 = ${d.b87} | b79 = ${d.b79} | b63 = ${d.b63n} | b54 = ${d.b54} | b39 = ${d.b39} | b38 = ${d.b38}`;
}

// Step 4
function renderP4() {
    // Render bit selector buttons (Z[7] to Z[0])
    let selectorEl = document.getElementById('step4-bit-selector');
    if (selectorEl) {
        let btnHtml = '';
        for (let s = 0; s < 8; s++) {
            let bitNum = 7 - s;
            let bitVal = zBits[s];
            let isSelected = s === selectedStep4BitIndex;
            btnHtml += `<button class="preset ${isSelected ? 'active' : ''}" style="${isSelected ? 'border-color: var(--purple); color: var(--purple); background: rgba(168,85,247,0.15); font-weight:700;' : ''}" onclick="selectStep4Bit(${s})">
                Z[${bitNum}] (S${s}) = ${bitVal}
            </button>`;
        }
        selectorEl.innerHTML = btnHtml;
    }

    let d = allDets[selectedStep4BitIndex] || detS0;
    let bitNum = 7 - selectedStep4BitIndex;

    document.getElementById('step4-deriv-title').innerText = 
        `🔬 Step-by-Step Keystream Derivation for Z[${bitNum}] (State S${selectedStep4BitIndex})`;

    document.getElementById('hx-terms-eval').innerText = 
        `Term 1: (${d.s124}·${d.s102}) = ${d.t1} | Term 2: (${d.s81}·${d.s63}) = ${d.t2} | Term 3: (${d.s57}·${d.b118}) = ${d.t3} | Term 4: (${d.b87}·${d.b79}) = ${d.t4} | Term 5: (${d.s124}·${d.s57}·${d.b39}) = ${d.t5}`;
    
    document.getElementById('hx-final-eval').innerText = 
        `h(x) = ${d.t1} ⊕ ${d.t2} ⊕ ${d.t3} ⊕ ${d.t4} ⊕ ${d.t5} = ${d.h}`;
    
    document.getElementById('z7-final-eval').innerText = 
        `Z[${bitNum}] = ${d.h} (h) ⊕ ${d.s34} ⊕ ${d.b125} ⊕ ${d.b112} ⊕ ${d.b91} ⊕ ${d.b82} ⊕ ${d.b63n} ⊕ ${d.b54} ⊕ ${d.b38} = ${d.z}`;
    
    let zHex = zByte.toString(16).padStart(2,'0').toUpperCase();
    let zBinStr = zBits.join('');
    document.getElementById('full-zbyte-result').innerText = 
        `Full 8-Bit Keystream Byte Z[7:0] = ${zBinStr} (0x${zHex})`;
}

function selectStep4Bit(idx) {
    selectedStep4BitIndex = idx;
    renderP4();
}


// Step 5 (Encryption Table)
function renderP5() {
    let tbody = document.getElementById('enc-table-body');
    let html = '';
    
    for (let b = 7; b >= 0; b--) {
        let pB = (pByte >> b) & 1;
        let zB = zBits[7 - b];
        let cB = (cByte >> b) & 1;
        let posName = b === 7 ? 'Bit 7 (MSB)' : (b === 0 ? 'Bit 0 (LSB)' : `Bit ${b}`);
        
        html += `<tr>
            <td><strong>${posName}</strong></td>
            <td class="${pB ? 'b1' : 'b0'}">${pB}</td>
            <td class="${zB ? 'b1' : 'b0'}">${zB}</td>
            <td class="bx">${pB} ⊕ ${zB}</td>
            <td class="br">${cB}</td>
        </tr>`;
    }
    
    let pHex = pByte.toString(16).padStart(2,'0').toUpperCase();
    let pBinStr = pByte.toString(2).padStart(8,'0');
    let zHex = zByte.toString(16).padStart(2,'0').toUpperCase();
    let zBinStr = zBits.join('');
    let cHex = cByte.toString(16).padStart(2,'0').toUpperCase();
    let cBinStr = cByte.toString(2).padStart(8,'0');
    
    html += `<tr style="border-top: 2px solid var(--border-glow-amber); background: var(--bg-code);">
        <td colspan="5">
            <strong>Plaintext P:</strong> ${pBinStr} (0x${pHex}, '${currentChar}') | 
            <strong>Keystream Z:</strong> ${zBinStr} (0x${zHex}) | 
            <strong>Ciphertext C:</strong> ${cBinStr} (0x${cHex})
        </td>
    </tr>`;
    
    tbody.innerHTML = html;
}

// Step 6
function renderP6() {
    let cHex = cByte.toString(16).padStart(2,'0').toUpperCase();
    let cBinStr = cByte.toString(2).padStart(8,'0');
    let pHex = pByte.toString(16).padStart(2,'0').toUpperCase();
    let pBinStr = pByte.toString(2).padStart(8,'0');
    
    document.getElementById('cipher-hex-val').innerText = `0x${cHex}`;
    document.getElementById('cipher-bin-val').innerText = cBinStr;
    document.getElementById('cmp-orig-val').innerText = `'${currentChar}' (0x${pHex} = ${pBinStr})`;
    document.getElementById('cmp-enc-val').innerText = `0x${cHex} (${cBinStr})`;
}

// Step 7 (Decryption Table)
function renderP7() {
    let tbody = document.getElementById('dec-table-body');
    let html = '';
    
    for (let b = 7; b >= 0; b--) {
        let cB = (cByte >> b) & 1;
        let zB = zBits[7 - b];
        let pB = (pDecByte >> b) & 1;
        let posName = b === 7 ? 'Bit 7 (MSB)' : (b === 0 ? 'Bit 0 (LSB)' : `Bit ${b}`);
        
        html += `<tr>
            <td><strong>${posName}</strong></td>
            <td class="br">${cB}</td>
            <td class="${zB ? 'b1' : 'b0'}">${zB}</td>
            <td class="bx">${cB} ⊕ ${zB}</td>
            <td class="bd">${pB}</td>
        </tr>`;
    }
    
    tbody.innerHTML = html;
    
    let pHex = pDecByte.toString(16).padStart(2,'0').toUpperCase();
    let pBinStr = pDecByte.toString(2).padStart(8,'0');
    
    document.getElementById('rec-hex-val').innerText = `0x${pHex}`;
    document.getElementById('rec-bin-val').innerText = pBinStr;
    document.getElementById('recovered-msg').innerText = `'${currentChar}'`;
}

function loadPreset(ch) {
    let input = document.getElementById('message-input');
    input.value = ch;
    calculateSingleChar(ch);
    renderPage(curStep);
}

function onInput() {
    let input = document.getElementById('message-input');
    let val = input.value || 'H';
    calculateSingleChar(val[0]);
    renderPage(curStep);
}

function toggleTapModal(show) {
    let overlay = document.getElementById('tap-modal-overlay');
    if (overlay) {
        if (show) overlay.classList.add('active');
        else overlay.classList.remove('active');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    let input = document.getElementById('message-input');
    input.value = 'H';
    input.addEventListener('input', onInput);

    calculateSingleChar('H');
    buildProgressBar();
    goToStep(1);
});

