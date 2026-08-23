# 🎓 Grain-128 ASIC & Cryptography Viva Q&A Guide

> **Project Title**: Design and ASIC Implementation of Integrated LFSR-NFSR Based Pseudorandom Generator Using 45nm Tech  
> **Target**: Viva Voce Preparation, Technical Q&A, and Presentation Defense

---

## 📚 Table of Contents
1. [Q1: Why is the Keystream Byte `10000000` (`0x80`) identical for every letter?](#q1-why-is-the-keystream-byte-10000000-0x80-identical-for-every-letter)
2. [Q2: Does the real 45nm Grain-128 Silicon ASIC Chip work this exact same way?](#q2-does-the-real-45nm-grain-128-silicon-asic-chip-work-this-exact-same-way)
3. [Q3: Why do `h(x)` values change between `Z[7]` and `Z[6]`?](#q3-why-do-hx-values-change-between-z7-and-z6)
4. [Q4: Why do `s124` and other tap values change across steps?](#q4-why-do-s124-and-other-tap-values-change-across-steps)
5. [Q5: What happens to `s124` at step `Z[5]`?](#q5-what-happens-to-s124-at-step-z5)
6. [Q6: What if the Keystream gets intercepted or hacked?](#q6-what-if-the-keystream-gets-intercepted-or-hacked)
7. [Q7: How does a hacker reverse-engineer data if they steal the Secret Key & IV?](#q7-how-does-a-hacker-reverse-engineer-data-if-they-steal-the-secret-key--iv)
8. [Q8: What real-world industry components use Grain-128 currently?](#q8-what-real-world-industry-components-use-grain-128-currently)
9. [Q9: What if the builder or fabricator hardcodes the Secret Key in silicon?](#q9-what-if-the-builder-or-fabricator-hardcodes-the-secret-key-in-silicon)
10. [Q10: Can an attacker hack all devices if they extract one Secret Key?](#q10-can-an-attacker-hack-all-devices-if-they-extract-one-secret-key)
11. [Q11: How do sender and receiver decode data if every chip has a unique key?](#q11-how-do-sender-and-receiver-decode-data-if-every-chip-has-a-unique-key)
12: [Q12: How does Bluetooth pair dynamically without pre-built hardcoded keys?](#q12-how-does-bluetooth-pair-dynamically-without-pre-built-hardcoded-keys)
13. [Q13: How do passive battery-less RFID tags exchange keys with a reader?](#q13-how-do-passive-battery-less-rfid-tags-exchange-keys-with-a-reader)
14. [Q14: How does Decryption (Decoding) recover the exact original character?](#q14-how-does-decryption-decoding-recover-the-exact-original-character)
15. [Q15: How does the Keystream and Ciphertext change for the 2nd byte (2nd letter)?](#q15-how-does-the-keystream-and-ciphertext-change-for-the-2nd-byte-2nd-letter)
16. [Q16: How does the entire 128-bit state vector (`s` and `b`) shift across bytes?](#q16-how-does-the-entire-128-bit-state-vector-s-and-b-shift-across-bytes)
17. [Q17: How are the 128-bit registers (`s` and `b`) loaded from the Secret Key & IV?](#q17-how-are-the-128-bit-registers-s-and-b-loaded-from-the-secret-key--iv)
18. [Q18: What is the exact mathematical formula for the `h(x)` filter function?](#q18-what-is-the-exact-mathematical-formula-for-the-hx-filter-function)

---

### Q1: Why is the Keystream Byte `10000000` (`0x80`) identical for every letter?

**Answer:**  
In Stream Ciphers (like Grain-128), the **Keystream Generator is a pseudorandom number generator** that depends **ONLY** on the initial secret Key and IV (seed state). The input plaintext message (`P`) does **NOT** feed back into the register state generator during keystream creation.

For the very first 8-bit clock cycle (Byte 0), starting from the same seed state (`State S0`), the generator will **always produce the exact same first keystream byte `10000000` (`0x80`)**, regardless of whether the input character is `'H'`, `'a'`, or `'z'`.

#### How Encryption Differs per Letter:
Even though the keystream `Z = 10000000` (`0x80`) is constant for Byte 0, the final **Ciphertext (`C`) is unique for every letter** because each letter has a different ASCII binary representation (`C = P ⊕ Z`):

| Input Letter | ASCII (Hex) | Plaintext Binary `P` | Keystream `Z` | Ciphertext `C = P ⊕ Z` | Ciphertext Hex `C` |
| :---: | :---: | :---: | :---: | :---: | :---: |
| `'H'` | `0x48` | `01001000` | `10000000` | `11001000` | **`0xC8`** |
| `'a'` | `0x61` | `01100001` | `10000000` | `11100001` | **`0xE1`** |
| `'z'` | `0x7A` | `01111010` | `10000000` | `11111010` | **`0xFA`** |

> 💡 **Viva Summary**: *"The keystream `Z` is generated independently of the message from the key and IV seeds. Security comes from bitwise XOR (`C = P ⊕ Z`), which yields a unique ciphertext for every letter."*

---

### Q2: Does the real 45nm Grain-128 Silicon ASIC Chip work this exact same way?

**Answer:**  
**Yes, 100% identically!** The web application visualizer is a direct mathematical mirror of our Verilog RTL implementation (`flow_45nm_128bit/rtl/lfsr_nfsr_top.v`).

When the hardware chip encrypts the 16-character string `"LFSR NFSR 128BIT"`:
1. **Clock Cycle 1**: Registers load Key & IV seeds. The 8-bit unrolled wire logic produces Keystream Byte 0 = **`0x80`**. It XORs with `'L'` (`0x4C`) to produce Ciphertext `0xCC`.
2. **Clock Cycle 2**: Registers advance 8 steps. Wire logic produces Keystream Byte 1 = **`0x3C`**. It XORs with `'F'` (`0x46`) to produce Ciphertext `0x7A`.
3. **Clock Cycle 16**: Full 128-bit block encrypted in **16 clock cycles**!

> 💡 **Viva Summary**: *"The web app mirrors our Verilog RTL logic gate equations. Both hardware and software produce `0x80` for Byte 0 when initialized with standard demonstration seeds."*

---

### Q3: Why do `h(x)` values change between `Z[7]` and `Z[6]`?

**Answer:**  
The values of `h(x)` change because **each unrolled bit (`Z[7]` down to `Z[0]`) is evaluated at a different shift state (`S0` through `S7`)**:

```text
State 0 (S0): Initial Register Taps       ──► Generates Z[7] (MSB)
                 │
           [Wire Step +1]
                 ▼
State 1 (S1): Shifted by +1 Position      ──► Generates Z[6]
```

- **`Z[7]` (State `S0`)**: Evaluates `h(x)` using initial taps (`s124, s102, s81, s63, s57, b118, b87, b79, b39`). Term 4 is `(1·1) = 1`, resulting in `h(x) = 1`.
- **`Z[6]` (State `S1`)**: Evaluates `h(x)` after all register bits shift forward by 1 position. Terms 2, 3, 5 become `1`, resulting in `h(x) = 1`.

> 💡 **Viva Summary**: *"Our 8-bit parallel architecture computes 8 consecutive shift states (`S0` to `S7`) in 1 clock cycle. Because register bits move down by 1 position per state, the 5 AND-product terms of `h(x)` receive different bit values."*

---

### Q4: Why do `s124` and other tap values change across steps?

**Answer:**  
Because the **LFSR and NFSR are Shift Registers**.

At every step transition (from State `S0` to State `S1`):
1. The bit at position `123` shifts into position `124`.
2. The bit at position `124` shifts into position `125`.
3. A new feedback bit enters position `0`.

Therefore:
- At **State `S0`**: Index `124` holds the original bit `s124`.
- At **State `S1`**: Index `124` holds the bit that was previously at position `123`.

> 💡 **Viva Summary**: *"As the register contents shift forward, index `124` receives the incoming bit from index `123`, causing the binary value (`0` or `1`) at tap `124` to change."*

---

### Q5: What happens to `s124` at step `Z[5]`?

**Answer:**  
Tracking original bit `s124` across the shift steps:
- **At `Z[7]` (State `S0`)**: Original `s124` is at index **124**.
- **At `Z[6]` (State `S1`)**: Original `s124` shifts into index **125**.
- **At `Z[5]` (State `S2`)**: Original `s124` shifts into index **126**.

Conversely, looking at Tap Index 124:
- At `Z[7]` (`S0`), Tap 124 reads original **`s124`**.
- At `Z[6]` (`S1`), Tap 124 reads original **`s123`**.
- At `Z[5]` (`S2`), Tap 124 reads original **`s122`**.

---

### Q6: What if the Keystream gets intercepted or hacked?

**Answer:**  

1. **Single-Session Decryption (Known-Keystream Attack)**:
   If an attacker captures keystream `Z` for a specific session, they can decrypt that specific message (`P = C ⊕ Z`).
2. **Key Recovery is IMPOSSIBLE**:
   An attacker **cannot reverse-engineer the 128-bit Secret Key** because of Grain-128's **nonlinear NFSR feedback** and 5-term **`h(x)` filter function** (degree-3 terms). Reversing these non-linear Boolean equations requires $2^{128}$ operations (billions of years).
3. **Preventing Keystream Reuse (IV Refresh)**:
   Grain-128 mixes a **fresh Initial Vector (IV / Nonce)** into the starting register seeds for every new message:
   `Initial State = Secret Key (128 bits) + Fresh IV (96 bits)`
   Even with the same Key, a new IV generates a 100% unique keystream, rendering past captured keystreams useless.

> 💡 **Viva Summary**: *"Intercepting a keystream only decrypts that single transmission. The high algebraic immunity of `h(x)` prevents key recovery, and fresh IVs per message prevent keystream reuse attacks."*

---

### Q7: How does a hacker reverse-engineer data if they steal the Secret Key & IV?

**Answer:**  

#### Step-by-Step Reverse-Engineering Lab:
1. **Captured Data**:
   - Stolen Key: `0xACE123456789ABCDEF0123456789ABCE`
   - Intercepted Public IV: `0x123456789ABCDEF0123456789ABCDEF0`
   - Intercepted Ciphertext Byte ($C_0$): `0xC8` (`11001000`)
2. **Recompute Keystream ($Z_0$)**:
   Hacker loads Key & IV into their Grain-128 script → computes $h(x) = 1$ → generates $Z_0 = \mathbf{0x80}$ (`10000000`).
3. **Apply XOR Decryption Rule**:
   `P0 = C0 ⊕ Z0 = 11001000 ⊕ 10000000 = 01001000`
4. **Convert Binary to Text**:
   `Binary 01001000 ──► Decimal 72 ──► ASCII Character 'H'`

---

### Q8: What real-world industry components use Grain-128 currently?

**Answer:**  

1. **RFID Tags & Smart Cards (Contactless Payments & Metro Cards)**:
   - Ultra-low power (~324 µW) and small silicon area (1,106 standard cells) ideal for battery-less RF power harvesting.
2. **BLE Medical Wearables (Continuous Glucose Monitors, ECG Patches)**:
   - 800 Mbps throughput at ~26 nJ per block extends coin-cell battery life for months.
3. **Industrial IoT & Smart Meters**:
   - Lightweight encryption for LoRaWAN / Zigbee wireless sensors.
4. **Automotive TPMS (Tire Pressure Monitoring Systems)**:
   - Low-latency encryption for high-temperature wheel sensors.
5. **Hardware Security Modules (HSM) & PRNGs**:
   - On-chip pseudorandom session key generator inside microcontrollers.

---

### Q9: What if the builder or fabricator hardcodes the Secret Key in silicon?

**Answer:**  
If a key is hardcoded into standard cell metal wires by the designer or builder, **anyone with the GDSII / DEF layout file or semiconductor foundry mask can easily read it**.

#### How Industry Prevents This:
Commercial security chips are manufactured **BLANK**. The secret key is programmed **post-fabrication** in a secure facility using:
- **eFuse burning** (One-Time Programmable memory).
- **PUF (Physically Unclonable Functions)**: Uses microscopic, un-cloneable manufacturing variations in transistor threshold voltages to generate a unique key inside the chip die.

> 💡 **Viva Summary**: *"Hardcoding keys in silicon layout creates supply-chain vulnerabilities. Industry chips are fabricated blank, and keys are injected post-fabrication via eFuses or silicon PUFs."*

---

### Q10: Can an attacker hack all devices if they extract one Secret Key?

**Answer:**  
**NO!** Every physical device manufactured receives a **unique 128-bit secret key**:
- Device A (e.g. Glucose Monitor #1) = **Key A**
- Device B (e.g. Glucose Monitor #2) = **Key B**

If an attacker destroys Device A and extracts Key A, they gain **zero access** to Device B.

> 💡 **Kerckhoffs's Principle**: *"The security of a cipher relies entirely on keeping the key secret, not the algorithm or gate layout."*

---

### Q11: How do sender and receiver decode data if every chip has a unique key?

**Answer:**  
Grain-128 is a **Symmetric Cipher**, meaning both sender and authorized receiver share the **exact same key** for that specific pairing.

- **Sender (Glucose Sensor #4092)** has **Key #4092**.
- **Receiver (User's Smartphone)** holds **Key #4092** in its secure database.
- **Eavesdroppers** have neither key, so they cannot decrypt the transmission.

---

### Q12: How does Bluetooth pair dynamically without pre-built hardcoded keys?

**Answer:**  
Bluetooth devices do **NOT** have hardcoded keys at the factory. Instead, they use a **2-stage process**:

1. **Dynamic Handshake (ECDH - Elliptic Curve Diffie-Hellman)**:
   When you press "Pair", the phone and Bluetooth device exchange public keys over the air. Using asymmetric Diffie-Hellman math, **both sides compute the exact same shared 128-bit key locally**, without ever sending the secret key over the air.
2. **Grain-128 Execution**:
   Once the 128-bit key is generated, the slow ECDH engine turns off, and the key is loaded into the **Grain-128 ASIC hardware engine** for high-speed (800 Mbps), low-power encryption.

> 💡 **Viva Summary**: *"Bluetooth uses ECDH public-key handshake to dynamically establish a shared 128-bit key during pairing, then passes that key to Grain-128 for high-speed streaming."*

---

### Q13: How do passive battery-less RFID tags exchange keys with a reader?

**Answer:**  
Passive RFID tags have no battery or screen to perform a 4-second Bluetooth handshake (~50 ms power window). RFID systems use 2 industry methods:

1. **Pre-Provisioned Central Database (Metro Cards / Bank Badges)**:
   The tag broadcasts its public serial ID (`"Card #8812"`). The reader looks up `"Card #8812"` in a secure database, retrieves Key `K_8812`, and authenticates via Grain-128.
2. **Master Key Derivation KDF (Offline Hotel Room Doors)**:
   The door reader knows a **Master Secret Key (`K_master`)**. When you tap your card, the reader reads your Card UID and derives your card's key on the fly:
   `Card Key K_card = Grain-128(Master Key K_master, Card UID)`

---

### Q14: How does Decryption (Decoding) recover the exact original character?

**Answer:**  
Decryption works because **Bitwise XOR is a mathematical self-inverse operation (`A ⊕ B ⊕ B = A`)**:

1. **Encoding (Encryption)**:  
   `Ciphertext C = Plaintext P ⊕ Keystream Z`
2. **Decoding (Decryption)**:  
   `Recovered P = Ciphertext C ⊕ Keystream Z`

Substituting `C` into the decoding equation:
`Recovered P = (Plaintext P ⊕ Keystream Z) ⊕ Keystream Z`  
`Recovered P = Plaintext P ⊕ (Keystream Z ⊕ Keystream Z)`  
Since any bit XORed with itself cancels to zero (`Z ⊕ Z = 0`):  
`Recovered P = Plaintext P ⊕ 0 = Plaintext P`

#### Numerical Example (Character `'H'`):
* **Plaintext `'H'`**: `01001000` (`0x48`)
* **Keystream Byte**: `10000000` (`0x80`)
* **Encoding**: `01001000 ⊕ 10000000 = 11001000` (`0xC8`)
* **Decoding**: `11001000 ⊕ 10000000 = 01001000` (`0x48` = `'H'`)

> 💡 **Viva Summary**: *"Bitwise XOR is self-inverse (`A ⊕ B ⊕ B = A`). When the receiver XORs the ciphertext with the identical keystream byte, the keystream bits cancel out to 0, recovering the original ASCII character."*

---

### Q15: How does the Keystream and Ciphertext change for the 2nd byte (2nd letter)?

**Answer:**  
When encrypting a 2-letter word (e.g. `"HI"` or `"HA"`):

1. **Keystream Advances by 8 Steps**:  
   For the 1st letter (`'H'`), the cipher evaluates States `S0..S7`, producing Keystream Byte 1 = **`10000000` (`0x80`)**.  
   For the 2nd letter (`'I'`), the cipher registers advance 8 clock steps to States `S8..S15`, producing Keystream Byte 2 = **`01111010` (`0x7A`)**.

2. **Bitwise XOR for Word `"HI"`**:
   - **1st Letter `'H'`** (`0x48`): `01001000 ⊕ 10000000` → **`11001000` (`0xC8`)**
   - **2nd Letter `'I'`** (`0x49`): `01001001 ⊕ 01111010` → **`00110011` (`0x33`)**

> 💡 **Viva Summary**: *"Each character position in a message gets its own unique keystream byte because the shift registers advance by 8 clocks per character (`0x80` for Byte 1, `0x7A` for Byte 2)."*

---

### Q16: How does the entire 128-bit state vector (`s` and `b`) shift across bytes?

**Answer:**  
At every clock step, the 128-bit LFSR vector (`s`) and 128-bit NFSR vector (`b`) shift by 1 position. For 1 full byte (8 clock steps), the entire 128-bit state vector updates as follows:

1. **Upper 120 Bits (`s127..s8` & `b127..b8`) Shift Left by 8 Positions**:  
   Every position `i` (for `i ≥ 8`) receives the bit value that was sitting at index `i - 8` in Byte 1:
   - `s127 (Byte 2) = s119 (Byte 1)`
   - `s124 (Byte 2) = s116 (Byte 1)`
   - `s102 (Byte 2) = s94 (Byte 1)`
   - `b118 (Byte 2) = b110 (Byte 1)`
2. **Lowest 8 Bits (`s7..s0` & `b7..b0`) Receive New Feedback**:  
   Indices 0 through 7 are filled with the 8 newly calculated feedback bits (`Lfb0..Lfb7` and `Nfb0..Nfb7`) computed during Byte 1.

> 💡 **Viva Summary**: *"For every byte encrypted, the entire 128-bit state array shifts left by 8 positions, and indices 0..7 are filled with 8 new feedback bits."*

---

### Q17: How are the 128-bit registers (`s` and `b`) loaded from the Secret Key & IV?

**Answer:**  
In Grain-128, the 128-bit state registers are loaded directly from Hexadecimal strings (where each hex character maps to 4 binary bits):

1. **NFSR Register (`b`)**: Loaded with the **128-bit Secret Key** (`123456789ABCDEF0123456789ABCDEF0`).  
   - Hex `1` → `0001` → `b127=0, b126=0, b125=0, b124=1`
   - Hex `2` → `0010` → `b123=0, b122=0, b121=1, b120=0`
2. **LFSR Register (`s`)**: Loaded with the **96-bit IV** + 32 padding ones (`ACE123456789ABCDEF0123456789ABCE`).  
   - Hex `A` → `1010` → `s127=1, s126=0, s125=1, s124=0`
   - Hex `C` → `1100` → `s123=1, s122=1, s121=0, s120=0`

> 💡 **Viva Summary**: *"Each hex character maps to 4 binary bits. The 128-bit Secret Key is written into the NFSR (`b`), while the 96-bit IV + padding is written into the LFSR (`s`)."*

---

### Q18: What is the exact mathematical formula for the `h(x)` filter function?

**Answer:**  
The non-linear filter function `h(x)` samples 5 LFSR taps (`s`) and 4 NFSR taps (`b`):

`h(x) = (x0 · x1) ⊕ (x2 · x3) ⊕ (x4 · x5) ⊕ (x6 · x7) ⊕ (x0 · x4 · x8)`

Substituting the 9 tap registers:
`h(x) = (s124 · s102) ⊕ (s81 · s63) ⊕ (s57 · b118) ⊕ (b87 · b79) ⊕ (s124 · s57 · b39)`

- **Degree**: Non-linear algebraic degree of 3 (Term 5 = `s124 · s57 · b39`).
- **Cryptographic Role**: Ensures high algebraic immunity to prevent algebraic state recovery attacks.

---

### 🏆 Master Viva Summary Cheat Sheet

| Topic | Key Answer Point |
| :--- | :--- |
| **Byte 0 `0x80`** | Stream cipher keystream $Z$ depends only on seeds, not message. $C = P \oplus Z$ gives unique ciphertext. |
| **`h(x)` Changes** | 8-bit unrolling evaluates 8 shift states ($S_0 \dots S_7$) in parallel; shifted taps alter AND-term outputs. |
| **Key Extraction** | Intercepting $Z$ decrypts 1 message. $h(x)$ nonlinear immunity prevents key recovery; IV refresh prevents reuse. |
| **Physical Security** | Keys are not hardcoded in silicon; injected post-fabrication via eFuses / PUF. |
| **Device Security** | Every device pair has a unique 128-bit key. Hacking 1 chip does not compromise others. |
| **Bluetooth Pairing** | Uses ECDH public-key handshake to derive 128-bit key on the fly, then runs Grain-128. |
| **RFID Operation** | Uses central database key lookup by Card UID or local Master Key Derivation (KDF). |
| **Decryption Proof** | XOR self-inverse ($A \oplus B \oplus B = A$). Receiver XORs ciphertext with matching keystream to recover $P$. |
| **2nd Byte Keystream** | Registers advance 8 steps ($S_8 \dots S_{15}$), producing 2nd keystream byte `0x7A` (`01111010`). |
| **128-Bit Register Shift**| Upper 120 bits shift left by 8 positions ($i \to i-8$); indices 0..7 receive new feedback bits. |
| **Key/IV Loading** | Hex digits convert to 4 bits each. Secret Key populates NFSR (`b`), IV + padding populates LFSR (`s`). |
| **`h(x)` Formula** | `h(x) = (s124·s102) ⊕ (s81·s63) ⊕ (s57·b118) ⊕ (b87·b79) ⊕ (s124·s57·b39)`. Degree-3 non-linearity. |
