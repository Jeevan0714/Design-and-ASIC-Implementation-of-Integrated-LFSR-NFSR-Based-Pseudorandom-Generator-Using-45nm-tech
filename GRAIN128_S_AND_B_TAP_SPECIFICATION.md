# Grain-128 Complete 128-Bit Tap Specification & Usage Guide

This document provides a comprehensive, complete reference for every single bit tap position in the 128-bit Linear Feedback Shift Register (**LFSR**, vector `s` / `L`) and the 128-bit Non-Linear Feedback Shift Register (**NFSR**, vector `b` / `N`) used in the Grain-128 ASIC architecture.

---

## 1. Register Architecture Overview

Grain-128 consists of two 128-bit shift registers:

1. **`s` Vector (LFSR `L[127:0]`)**: 
   * **Length**: 128 bits (`s0` to `s127`)
   * **Role**: Provides linear feedback and guarantees maximum period ($2^{128}-1$).
   * **Shift Direction**: Shift left / right towards index 127. New feedback enters at LSB (`s0`), while oldest state sits at MSB (`s127`).

2. **`b` Vector (NFSR `N[127:0]`)**:
   * **Length**: 128 bits (`b0` to `b127`)
   * **Role**: Provides non-linear security and cryptographic strength.
   * **Shift Direction**: Coupled with LFSR. New feedback enters at LSB (`b0`), while oldest state sits at MSB (`b127`).

---

## 2. Mathematical Equations Using `s` and `b`

### A. LFSR Feedback Function `f(s)`
$$\text{Lfb} = s_{127} \oplus s_{120} \oplus s_{89} \oplus s_{57} \oplus s_{46} \oplus s_{31}$$

### B. NFSR Feedback Function `g(b, s)`
$$\begin{aligned}
\text{Nfb} = s_{127} &\oplus b_{127} \oplus b_{101} \oplus b_{71} \oplus b_{36} \oplus b_{31} \\
&\oplus (b_{124} \cdot b_{60}) \oplus (b_{116} \cdot b_{114}) \oplus (b_{110} \cdot b_{109}) \\
&\oplus (b_{100} \cdot b_{68}) \oplus (b_{87} \cdot b_{79}) \oplus (b_{66} \cdot b_{62}) \oplus (b_{59} \cdot b_{43})
\end{aligned}$$

### C. Non-Linear Filter Function `h(x)`
The non-linear function $h(x)$ takes 5 taps from LFSR (`s`) and 4 taps from NFSR (`b`):
$$x_0 = s_{124}, \quad x_1 = s_{102}, \quad x_2 = s_{81}, \quad x_3 = s_{63}, \quad x_4 = s_{57}$$
$$x_5 = b_{118}, \quad x_6 = b_{87}, \quad x_7 = b_{79}, \quad x_8 = b_{39}$$

$$h(x) = (x_0 \cdot x_1) \oplus (x_2 \cdot x_3) \oplus (x_4 \cdot x_5) \oplus (x_6 \cdot x_7) \oplus (x_0 \cdot x_4 \cdot x_8)$$
$$\implies h(x) = (s_{124} \cdot s_{102}) \oplus (s_{81} \cdot s_{63}) \oplus (s_{57} \cdot b_{118}) \oplus (b_{87} \cdot b_{79}) \oplus (s_{124} \cdot s_{57} \cdot b_{39})$$

### D. Final Keystream Bit `z`
$$\begin{aligned}
z = h(x) &\oplus s_{34} \oplus b_{125} \oplus b_{112} \oplus b_{91} \\
&\oplus b_{82} \oplus b_{63} \oplus b_{54} \oplus b_{38}
\end{aligned}$$

---

## 3. Complete Bit-by-Bit Reference Table (Taps 0 to 127)

Below is the complete functional assignment for every bit index `i` (0 to 127) in the **LFSR (`s`)** and **NFSR (`b`)** registers:

| Bit Index `i` | LFSR `s[i]` Usage | NFSR `b[i]` Usage |
| :---: | :--- | :--- |
| **127** | LFSR Feedback (`Lfb`), NFSR Coupling | NFSR Feedback (`Nfb`) |
| **126** | State storage | State storage |
| **125** | State storage | **Linear Keystream Tap** (`z`) |
| **124** | **Filter $h(x)$ Term 1 & 5** (`x0`) | NFSR Non-linear Product (`b124 · b60`) |
| **123** | State storage | State storage |
| **122** | State storage | State storage |
| **121** | State storage | State storage |
| **120** | **LFSR Feedback** (`Lfb`) | State storage |
| **119** | State storage | State storage |
| **118** | State storage | **Filter $h(x)$ Term 3** (`x5`) |
| **117** | State storage | State storage |
| **116** | State storage | NFSR Non-linear Product (`b116 · b114`) |
| **115** | State storage | State storage |
| **114** | State storage | NFSR Non-linear Product (`b116 · b114`) |
| **113** | State storage | State storage |
| **112** | State storage | **Linear Keystream Tap** (`z`) |
| **111** | State storage | State storage |
| **110** | State storage | NFSR Non-linear Product (`b110 · b109`) |
| **109** | State storage | NFSR Non-linear Product (`b110 · b109`) |
| **108** | State storage | State storage |
| **107** | State storage | State storage |
| **106** | State storage | State storage |
| **105** | State storage | State storage |
| **104** | State storage | State storage |
| **103** | State storage | State storage |
| **102** | **Filter $h(x)$ Term 1** (`x1`) | State storage |
| **101** | State storage | **NFSR Feedback** (`Nfb`) |
| **100** | State storage | NFSR Non-linear Product (`b100 · b68`) |
| **99..92** | State storage | State storage |
| **91** | State storage | **Linear Keystream Tap** (`z`) |
| **90** | State storage | State storage |
| **89** | **LFSR Feedback** (`Lfb`) | State storage |
| **88** | State storage | State storage |
| **87** | State storage | **Filter $h(x)$ Term 4** (`x6`), Product (`b87 · b79`) |
| **86..83** | State storage | State storage |
| **82** | State storage | **Linear Keystream Tap** (`z`) |
| **81** | **Filter $h(x)$ Term 2** (`x2`) | State storage |
| **80** | State storage | State storage |
| **79** | State storage | **Filter $h(x)$ Term 4** (`x7`), Product (`b87 · b79`) |
| **78..72** | State storage | State storage |
| **71** | State storage | **NFSR Feedback** (`Nfb`) |
| **70..69** | State storage | State storage |
| **68** | State storage | NFSR Non-linear Product (`b100 · b68`) |
| **67** | State storage | State storage |
| **66** | State storage | NFSR Non-linear Product (`b66 · b62`) |
| **65..64** | State storage | State storage |
| **63** | **Filter $h(x)$ Term 2** (`x3`) | **Linear Keystream Tap** (`z`) |
| **62** | State storage | NFSR Non-linear Product (`b66 · b62`) |
| **61** | State storage | State storage |
| **60** | State storage | NFSR Non-linear Product (`b124 · b60`) |
| **59** | State storage | NFSR Non-linear Product (`b59 · b43`) |
| **58** | State storage | State storage |
| **57** | **Filter $h(x)$ Term 3 & 5**, **LFSR Feedback** | State storage |
| **56..55** | State storage | State storage |
| **54** | State storage | **Linear Keystream Tap** (`z`) |
| **53..47** | State storage | State storage |
| **46** | **LFSR Feedback** (`Lfb`) | State storage |
| **45..44** | State storage | State storage |
| **43** | State storage | NFSR Non-linear Product (`b59 · b43`) |
| **42..40** | State storage | State storage |
| **39** | State storage | **Filter $h(x)$ Term 5** (`x8`) |
| **38** | State storage | **Linear Keystream Tap** (`z`) |
| **37** | State storage | State storage |
| **36** | State storage | **NFSR Feedback** (`Nfb`) |
| **35** | State storage | State storage |
| **34** | **Linear Keystream Tap** (`z`) | State storage |
| **33..32** | State storage | State storage |
| **31** | **LFSR Feedback** (`Lfb`) | **NFSR Feedback** (`Nfb`) |
| **30..0** | State storage (Shifting vector) | State storage (Shifting vector) |

---

## 4. 8-Bit Unrolled State Shifting Table (States $S_0$ to $S_7$)

In our 8-bit parallel ASIC architecture (`keystream.v`), 8 bits of keystream ($Z[7:0]$) are generated per clock cycle by combinationally evaluating 8 consecutive state steps ($S_0$ through $S_7$):

| Output Bit | Internal State | LFSR State Vector used | NFSR State Vector used |
| :---: | :---: | :---: | :---: |
| **`Z[7]`** | **State $S_0$** | `L[127:0]` | `N[127:0]` |
| **`Z[6]`** | **State $S_1$** | `Ls1[127:0] = {L[126:0], Lfb0}` | `Ns1[127:0] = {N[126:0], Nfb0}` |
| **`Z[5]`** | **State $S_2$** | `Ls2[127:0] = {Ls1[126:0], Lfb1}` | `Ns2[127:0] = {Ns1[126:0], Nfb1}` |
| **`Z[4]`** | **State $S_3$** | `Ls3[127:0] = {Ls2[126:0], Lfb2}` | `Ns3[127:0] = {Ns2[126:0], Nfb2}` |
| **`Z[3]`** | **State $S_4$** | `Ls4[127:0] = {Ls3[126:0], Lfb3}` | `Ns4[127:0] = {Ns3[126:0], Nfb3}` |
| **`Z[2]`** | **State $S_5$** | `Ls5[127:0] = {Ls4[126:0], Lfb4}` | `Ns5[127:0] = {Ns4[126:0], Nfb4}` |
| **`Z[1]`** | **State $S_6$** | `Ls6[127:0] = {Ls5[126:0], Lfb5}` | `Ns6[127:0] = {Ns5[126:0], Nfb5}` |
| **`Z[0]`** | **State $S_7$** | `Ls7[127:0] = {Ls6[126:0], Lfb6}` | `Ns7[127:0] = {Ns7[126:0], Nfb6}` |

---

## 5. Summary Statistics

* **Total LFSR Taps Used**: 7 distinct indices (`127, 124, 120, 102, 89, 81, 63, 57, 46, 34, 31`)
* **Total NFSR Taps Used**: 24 distinct indices (`127, 125, 124, 118, 116, 114, 112, 110, 109, 101, 100, 91, 87, 82, 79, 71, 68, 66, 63, 62, 60, 59, 54, 43, 39, 38, 36, 31`)
* **Non-Linear Degree of $h(x)$**: Degree 3 (max term $s_{124} \cdot s_{57} \cdot b_{39}$)
* **Non-Linear Degree of NFSR Feedback**: Degree 2 (quadratic product terms)
