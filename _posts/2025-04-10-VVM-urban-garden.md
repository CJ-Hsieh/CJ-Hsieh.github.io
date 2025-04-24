---
title: 'Urbanization and Diurnal Convection: Can Cities Make Their Own Rain?'
date: 2025-04-10
permalink: /posts/2025/04/VVM-urban-garden/
tags:
  - climate model
  - land-atmosphere interaction
  - convection
---

## 🌆🌱 Preface: Grass or Concrete — Who Wins the Rain Game?

Grasslands can *breathe* — they release moisture into the air. Concrete? Not so much.  
So, if you mix both in a city, where would you expect it to rain more?  
**The grass, right? It’s wetter!**  
Well... not quite.

Turns out, **the atmosphere has its own ideas**. It organizes wind and clouds in ways that sometimes **make it rain over the driest part — the city itself**.
Please see my undergraduate summer program research advised by Prof. Chien-Ming Wu.

---

## 🔬 The Summer We Simulated a Virtual City

We used a cloud-resolving model called **VVM** to explore how surface heterogeneity affects **diurnal convection** — the daily build-up of clouds and rain.

We designed a world made of:
- 256 × 256 km domain
- 2 km horizontal resolution
- Sun heating everything equally 

**Then we tested:**
- All grass (control 🌿)
- (a) Urban09 (a small city center)
- (b) Urban32 (City becomes larger!)
- (c) Urban46 (Only a park locates in center domain)

<img src="/images/post/VVM-urban-garden/exp_setup.png" alt="Experiment setup: Grass vs. concrete blocks" width="60%">

---

## 🌡️ Grass Cools, Concrete Cooks

Using the **Bowen ratio** — the balance between sensible and latent heat — we found:
- When the grass areas decrease, the LH also decreases.
- Concrete heats up, dries out, and makes the air **hotter but drier**.

More urban = more sensible heat = stronger surface heating, but less moisture.

<img src="/images/post/VVM-urban-garden/figure_wqv_wth.png" alt="Bowen ratio: Latent vs. sensible heat" width="60%">

---

## ☁️ Boundary Layers, Clouds, and... Surprising Rain

You’d think more moisture = more clouds = more rain.  
That works in the control run. But once cities come in, the game changes.

As cities expand:
- Cloud tops **get lower**, and rain forms **later** in the day.
- The boundary layer develops later

<div style="display: flex; gap: 10px;">
  <img src="/images/post/VVM-urban-garden/figure_mse.png" alt="MSE and boundary layer" width="48%">
  <img src="/images/post/VVM-urban-garden/figure_qc_time_evolution.png" alt="Cloud development over time" width="48%">
</div>

---

## 🌧️ Concrete Rain

The result?  
**Rain tends to form over the city**, even though it’s drier.

Why? The wind field in the morning shows surface temperature and moisture contrast sets up **sea breeze-like circulations**, pulling wetter air inward from grass to city.
Then in the afternoon, it rains over city, accompanying with wind divergence.

This behavior flips our intuition — it’s not "wet places get wetter."  
Instead, the **atmosphere organizes around gradients** in heat and moisture, favoring convergence and upward motion over **urban cores**.

<div style="display: flex; gap: 10px;">
  <img src="/images/post/VVM-urban-garden/figure_precip_gridpoint.png" alt="Rainfall pattern" width="48%">
  <img src="/images/post/VVM-urban-garden/figure_precip_gridpoint_2.png" alt="Wind and rain field" width="48%">
</div>
---

## 🧠 Bigger Picture

This research highlights how **land-atmosphere feedbacks** and **surface heterogeneity** shape local rainfall.  
The atmosphere tends to homogeneize the moisture distribution through rainfall over drier regions.

---

📚 References:
- Seneviratne et al., *Nature*, 2006  
- Wu et al., *JGR Atmospheres*, 2015  
- Held & Soden, *J. Climate*, 2006  
- Zhou et al., *Nature Climate Change*, 2021
