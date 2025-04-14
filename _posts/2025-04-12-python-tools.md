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

## Atmospheric data

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
<summary><strong>Atmospheric data - Hadley circulation</strong></summary>

<pre><code class="language-python">
  
import xarray as xr
import numpy as np
</code></pre>

</details> 

<p align="center">
  <img src="/images/post/python-tools/fig_hadley_cell.png" alt="Hadley cell" width="50%">
</p>

## Oceanic data

<details class="code-toggle">
<summary><strong>Oceanic data - Regrid</strong></summary>

<pre><code class="language-python">
import xesmf as xe
import xarray as xr
import numpy as np

def read_data(data):
    grid_in     = {'lon': data.TLONG, 'lat': data.TLAT}  # note: oceanic grid may be (TLONG, TLAT) or (ULONG, ULAT)
    grid_out    = {'lon': lon, 'lat': lat}               # the atmospheric grid or other grid you want
    regridder   = xe.Regridder(grid_in, grid_out, 'bilinear', periodic=True)
    var_out     = regridder(data)
    return var_out

ds_latlon = xr.open_dataset('/your_path/xxxx_cam.h0.1850-01.nc')
lat, lon = ds_latlon['lat'], ds_latlon['lon']

ds = xr.open_dataset('/your_path/xxxx_pop.h.1850-01.nc')
sst = ds['TEMP'].isel(z_t=0)

sst_reg = read_data(sst)
</code></pre>

</details>


<details class="code-toggle">  
<summary><strong>Oceanic data - SST trend</strong></summary>

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

## Projection

<details class="code-toggle">
<summary><strong>PlateCarree</strong></summary>

<pre><code class="language-python">
import xesmf as xe

</code></pre>
</details>

<details class="code-toggle">
<summary><strong>Robinson</strong></summary>

<pre><code class="language-python">
import cartopy

</code></pre>
</details>


<details class="code-toggle">
<summary><strong>Polar</strong></summary>

Ref: https://nordicesmhub.github.io/NEGI-Abisko-2019/training/example_NorthPolarStereo_projection.html
<pre><code class="language-python">
def sp_map(*nrs, projection = ccrs.PlateCarree(), **kwargs):
    return plt.subplots(*nrs, subplot_kw={'projection':projection}, **kwargs)

def add_map_features(ax):
    ax.coastlines(edgecolor='gray',alpha=0.5)
    #gl = ax.gridlines()
    #ax.add_feature(cy.feature.BORDERS);
    #gl = ax.gridlines(draw_labels=True)
    #gl.xlabels_top = True
    #gl.ylabels_right = True

def polarCentral_set_latlim(lat_lims, ax):
    ax.set_extent([-180, 180, lat_lims[0], lat_lims[1]], ccrs.PlateCarree())
    # Compute a circle in axes coordinates, which we can use as a boundary
    # for the map. We can pan/zoom as much as we like - the boundary will be
    # permanently circular.
    theta = np.linspace(0, 2*np.pi, 100)
    center, radius = [0.5, 0.5], 0.5
    verts = np.vstack([np.sin(theta), np.cos(theta)]).T
    circle = mpath.Path(verts * radius + center)

    ax.set_boundary(circle, transform=ax.transAxes)

level = np.arange(-10,30.1,2)
cmap = cmaps.BlueWhiteOrangeRed
fig, ax = sp_map(1, projection=ccrs.SouthPolarStereo())
lat_lims = [-50,-90]
Z3_SH.mean('time').isel(lev=-5).where(data['lat']<lat_lims[0]).\
                   plot(ax=ax, cmap=cmap,extend='both',levels=level,transform=ccrs.PlateCarree())
polarCentral_set_latlim(lat_lims, ax)
add_map_features(ax)
plt.show()
</code></pre>
</details>

/images/post/python-tools/sst_trend_plate.png
/images/post/python-tools/prect_ano.1301.019-2040-2070.png
/images/post/python-tools/figure_gpm_SH_inNH.png

