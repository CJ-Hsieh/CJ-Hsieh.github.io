---
title: 'Useful Python Tools'
date: 2025-04-12
permalink: /posts/2025/04/python-tools/
tags:
  - cool posts
  - category1
  - category2
---

Some of the Python codes are attached to help process climate model data.

---

## 🌀 Atmospheric data

<details class="code-toggle">
<summary><strong>Walker circulation</strong></summary>

<pre><code class="language-python">
# Walker circulation example code
import xarray as xr
import numpy as np
# Placeholder for walker cell diagnostics
print("Walker circulation diagnostics complete")
</code></pre>
</details>

<details class="code-toggle">
<summary><strong>Hadley circulation</strong></summary>

<pre><code class="language-python">
import xarray as xr
import numpy as np
</code></pre>
</details>

<p align="center">
  <img src="/images/post/python-tools/fig_hadley_cell.png" alt="Hadley cell" width="50%">
</p>

---

## 🌊 Oceanic data

<details class="code-toggle">
<summary><strong>Regridding SST (POP to CAM grid)</strong></summary>

<pre><code class="language-python">
import xesmf as xe
import xarray as xr
import numpy as np

def read_data(data):
    grid_in  = {'lon': data.TLONG, 'lat': data.TLAT}   # source grid
    grid_out = {'lon': lon, 'lat': lat}                # target grid
    regridder = xe.Regridder(grid_in, grid_out, 'bilinear', periodic=True)
    var_out = regridder(data)
    return var_out

# Load target lat/lon from CAM
ds_latlon = xr.open_dataset('/your_path/xxxx_cam.h0.1850-01.nc')
lat, lon = ds_latlon['lat'], ds_latlon['lon']

# Load POP SST and regrid
ds = xr.open_dataset('/your_path/xxxx_pop.h.1850-01.nc')
sst = ds['TEMP'].isel(z_t=0)
sst_reg = read_data(sst)
</code></pre>
</details>

<details class="code-toggle">
<summary><strong>Calculate SST trend</strong></summary>

<pre><code class="language-python">
# Calculate SST trend over time
import xarray as xr
import numpy as np

ds = xr.open_dataset('/your_path/xxxx_pop.h.1850-01.nc')
sst = ds['TEMP'].isel(z_t=0)
</code></pre>
</details>

<p align="center">
  <img src="/images/post/python-tools/sst_trend_robin.png" alt="SST trend" width="50%">
</p>

---

## 🌍 Projection examples

<details class="code-toggle">
<summary><strong>PlateCarree (basic projection)</strong></summary>

<pre><code class="language-python">
import xesmf as xe
</code></pre>
</details>

<details class="code-toggle">
<summary><strong>Robinson projection</strong></summary>

<pre><code class="language-python">
import cartopy
</code></pre>
</details>

<details class="code-toggle">
<summary><strong>South Polar projection</strong></summary>

Reference: https://nordicesmhub.github.io/NEGI-Abisko-2019/training/example_NorthPolarStereo_projection.html

<pre><code class="language-python">
def sp_map(*nrs, projection=ccrs.PlateCarree(), **kwargs):
    return plt.subplots(*nrs, subplot_kw={'projection': projection}, **kwargs)

def add_map_features(ax):
    ax.coastlines(edgecolor='gray', alpha=0.5)
    # ax.gridlines() and ax.add_feature can be enabled if needed

def polarCentral_set_latlim(lat_lims, ax):
    ax.set_extent([-180, 180, lat_lims[0], lat_lims[1]], ccrs.PlateCarree())
    theta = np.linspace(0, 2*np.pi, 100)
    center, radius = [0.5, 0.5], 0.5
    verts = np.vstack([np.sin(theta), np.cos(theta)]).T
    circle = mpath.Path(verts * radius + center)
    ax.set_boundary(circle, transform=ax.transAxes)

# Plotting example
level = np.arange(-10, 30.1, 2)
cmap = cmaps.BlueWhiteOrangeRed
fig, ax = sp_map(1, projection=ccrs.SouthPolarStereo())
lat_lims = [-50, -90]
Z3_SH.mean('time').isel(lev=-5).where(data['lat'] < lat_lims[0]) \
    .plot(ax=ax, cmap=cmap, extend='both', levels=level, transform=ccrs.PlateCarree())
polarCentral_set_latlim(lat_lims, ax)
add_map_features(ax)
plt.show()
</code></pre>
</details>

<!-- Three images displayed side by side -->
<div style="display: flex; justify-content: center; gap: 10px;">
  <img src="/images/post/python-tools/sst_trend_plate.png" alt="SST Trend Plate" style="width: 30%;">
  <img src="/images/post/python-tools/prect_ano.1301.019-2040-2070.png" alt="Precip anomaly" style="width: 30%;">
  <img src="/images/post/python-tools/figure_gpm_SH_inNH.png" alt="GPM SH in NH" style="width: 17%;">
</div>

---
