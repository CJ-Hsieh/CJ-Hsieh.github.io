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
<summary><strong>Hadley circulation</strong></summary>
The hytoP process is used to convert hybrid sigma levels (commonly used in GCM output) into standard pressure levels. If you are using reanalysis data such as ERA5, this step can be skipped — you may directly use the CALC_PSI function.
  
The example code requires the **Ngl** package. You can install it using the following command in a conda environment:
<pre><code class="language-bash">
conda create --name pyn_env --channel conda-forge/label/cf201901 pynio pyngl
</code></pre>

<pre><code class="language-python">
import xarray as xr
import numpy as np
import Ngl

a = 6378e3
g = 9.81    

p0   = 1000 # unit: hPa
plev = np.array([1000., 925., 850., 700., 500., 400., 300., 250., 200., 150., 100., \
                 70., 50., 30., 20., 10., 7., 5., 3., 2., 1.])
nplv = len(plev)
  
def CALC_PSI(data):
    # =============== hytoP ===================
    V = data['V'] 
    hyam, hybm, PS, lat = data['hyam'], data['hybm'], data['PS'], data['lat']
    V  = Ngl.vinth2p(V, hybm, hyam, plev, PS, intyp=1, p0=p0, ii=1, kxtrp=True)
    print('h2p finished')
    # =========================================
  
    nmo, nlat, nlon = len(data['time']), len(data['lat']), len(data['lon'])
    psi = np.zeros((nmo, nplv, nlat))
    A   = 2*np.pi*a*np.cos(lat*np.pi/180)/g
    psi[:,0,:] = 0
    for i in range(nmo):
        p  = np.tile(plev, (nlon, nlat, 1)).T    # p (lon,lat,lev).T = (lev,lat,lon)
        ps = np.tile(PS[i,:,:], (nplv, 1, 1))    # ps(lev,lat,lon)
        v  = np.where(ps>p, V[i,:,:,:], 0)       # V[i,:,:,:] = (lev,lat,lon)
        v_xz  = np.nanmean(v, axis=2)            #v_xz = (lev,lat)
        ### Calc Psi
        for k in range(1, nplv):
            trap = (v_xz[k,:]+v_xz[k-1,:])*(plev[k]-plev[k-1])/2
            psi[i,k,:] = psi[i,k-1,:]+A*trap
        ### Removing Residual
        psi_res = psi[i,-1,:]
        dP      = plev[:-1]-plev[1:]
        weight  = np.zeros((nplv))
        weight[1:] = np.cumsum(dP, axis=0)/plev[0]
        dist       = np.matmul(np.tile(weight, (1,1)).T, np.tile(psi_res, (1,1)))
        psi[i,:,:] = psi[i,:,:]-dist
    return psi

ds = xr.open_dataset('xxxx_cam.h0.1850-01.nc')
psi = CALC_PSI(ds)
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
import numpy as np
import xarray as xr
import matplotlib.pyplot as plt 
import cartopy.crs as ccrs
import cartopy
import cmaps
from matplotlib.ticker import MultipleLocator
import matplotlib as mpl
import glob

file_list = sorted(glob.glob(path+'sosstsst_ORAS5_1m_*_r1x1.nc'))
ds = xr.open_mfdataset(file_list)
SST = ds['sosstsst']
lat, lon = SST.lat, SST.lon

s = SST.where(SST!=0, np.nan)
s = s.groupby('time_counter.year').mean().values
trend = np.apply_along_axis(lambda x: np.polyfit(range(len(x)), x, 1)[0], axis=0, arr=s)

level = np.arange(-0.04, 0.041, 0.005)
cmap = cmaps.BlueDarkRed18

plt.figure(figsize=(10, 6))
ax = plt.axes(projection=ccrs.Robinson(central_longitude=180))
ax.coastlines()
ax.add_feature(cartopy.feature.LAND, facecolor='lightgray')

plt.contourf(lon, lat, trend, levels=level,
             cmap=cmap, transform=ccrs.PlateCarree(), extend='both')

cb = plt.colorbar(shrink=0.7,ticks=level[::4])
cb.ax.get_yaxis().set_tick_params(length=0,labelsize=14)

gl = ax.gridlines(draw_labels=True, xlocs=np.arange(-180, 180, 90), ylocs=np.arange(-90, 91, 30),ls='--')
gl.top_labels = False
gl.xlabel_style = {'size':14}
gl.ylabel_style = {'size':14}

plt.title('1979-2018 SST trend [K/yr]',fontsize=16,weight='bold')
plt.savefig('sst_trend_robin.png',dpi=300,bbox_inches='tight')
plt.show()

</code></pre>
</details>

<p align="center">
  <img src="/images/post/python-tools/sst_trend_robin.png" alt="SST trend" width="50%">
</p>

<details class="code-toggle">
<summary><strong>EOF analysis</strong></summary>

<pre><code class="language-python">
import numpy as np
import matplotlib.pyplot as plt
import xarray as xr
import netCDF4 as nc
import matplotlib.colors as mcolors
from matplotlib import gridspec
import pandas as pd
import cartopy.crs as ccrs
import cartopy
import glob
import cmaps
import xeofs as xe
from matplotlib.patches import Rectangle

# ========= Process SST data ==========================
ds  = xr.open_mfdataset(f'b.e21.BSSP370smbb.f09_g17.LE2-{en_name}.cam.h0.SST.*.nc')
sst = ds['SST']
sst['time'] = xr.cftime_range(start='1850-01-01',periods=len(sst['time']),freq='MS')
lat, lon = sst.lat, sst.lon
s = sst.where(sst!=0, np.nan)
sst_cli  = s.sel(time=slice('1900-01','1950-12'))
sst_ano = s.groupby('time.month') - sst_cli.groupby('time.month').mean('time')

# ======== Process wind data ==========================
ds = xr.open_mfdataset(f'TAUX_B*smbb.{en_name}.nc')
taux = -ds['TAUX']
taux_cli  = taux.sel(time=slice('1900-01','1950-12'))
taux_ano = taux.groupby('time.month') - taux_cli.groupby('time.month').mean('time')

ds = xr.open_mfdataset(tau_path + f'TAUY_B*smbb.{en_name}.nc')
tauy = -ds['TAUY']
tauy_cli  = tauy.sel(time=slice('1900-01','1950-12'))
tauy_ano = tauy.groupby('time.month') - tauy_cli.groupby('time.month').mean('time')

  
# =====  Choosing box and time period ==================
lat1, lat2, lon1, lon2 = -70, 70, 120, 280
beg_yr, end_yr = 1900, 2000
s_rm = sst_ano.sel(time=slice(f'{beg_yr}',f'{end_yr}'))
taux_rm = taux_ano.sel(time=slice(f'{beg_yr}',f'{end_yr}'))
tauy_rm = tauy_ano.sel(time=slice(f'{beg_yr}',f'{end_yr}'))

# ======================= Calc EOF ======================
s_rm_input = s_rm.sel(lat=slice(lat1,lat2), lon=slice(lon1,lon2))
model = xe.models.EOF(n_modes=5, use_coslat=True)
fit = model.fit(s_rm_input, dim=('time'))
ratio = model.explained_variance_ratio()
explained_var = ratio * 100
components = model.components()
scores = model.scores()
eof = np.asarray(components)

# ==================== Plot PC ==========================
mode = 1
pc1 = scores[mode-1, :] 
pc1_normalized = (pc1 - np.nanmean(pc1)) / np.nanstd(pc1)
time = np.linspace(beg_yr, end_yr, len(s_rm['time']))
  
plt.figure(figsize=(10, 4))
plt.plot(time, pc1_normalized, label=f'PC{mode} ({explained_var[mode-1]:.2f}%)', color='b')
plt.axhline(0, color='k', linewidth=0.8, linestyle='--')

plt.xlabel("Time", fontsize=14)
plt.ylabel("Amplitude", fontsize=14)
plt.title(f"PC{mode} Time Series", fontsize=16, weight='bold')
plt.ylim(-3,3)
plt.xlim(beg_yr, end_yr)
plt.xticks(np.arange(beg_yr, end_yr+1, 20), fontsize=14)
plt.yticks(fontsize=14)

plt.legend(fontsize=14)
#plt.savefig(f'new_eof/fig_pc{mode}_sst-{beg_yr}-{end_yr}.png',dpi=300,bbox_inches='tight')
plt.show()

# =============== Plot regression map ====================
mode = 1
pc1 = scores[mode-1, :]  
pc1_normalized = (pc1 - np.nanmean(pc1)) / np.nanstd(pc1)

regression = (s_rm * pc1_normalized.values[:, np.newaxis, np.newaxis]).mean(dim='time') / np.nanvar(pc1_normalized)
reg_taux = (taux_rm * pc1_normalized.values[:, np.newaxis, np.newaxis]).mean(dim='time') / np.nanvar(pc1_normalized)
reg_tauy = (tauy_rm * pc1_normalized.values[:, np.newaxis, np.newaxis]).mean(dim='time') / np.nanvar(pc1_normalized)

cmap = cmaps.NCV_blu_red
level = np.linspace(-2, 2., 21) 
ticks = np.arange(-2, 2.01, 0.4)

plt.figure(figsize=(10, 8))
ax = plt.axes(projection=ccrs.Robinson(central_longitude=150))

plt.contourf(lon, lat, regression, cmap=cmap, transform=ccrs.PlateCarree(), levels=level, extend='both',alpha=0.9)
cbar = plt.colorbar(shrink=0.5, ticks=ticks)
cbar.set_label("[°C/std]",fontsize=14)
cbar.ax.get_yaxis().set_tick_params(length=0, labelsize=14)

inv = 8
q = plt.quiver(lon[::inv], lat[20:-20:inv], reg_taux.values[20:-20:inv, ::inv], reg_tauy.values[20:-20:inv, ::inv], 
              transform=ccrs.PlateCarree(),scale=0.3, color='k',width=0.002)

plt.title(f"SST regression map onto PC{mode}", weight='bold', fontsize=16)
plt.title(f'{beg_yr}-{end_yr}', loc='right', fontsize=14)
plt.text(0.95, 0.95, f'{explained_var[mode-1]:.2f}%', 
        transform=ax.transAxes, 
        fontsize=14, ha='right', va='top', color='black',
        bbox=dict(facecolor='white', alpha=0.7))

ax.coastlines()
ax.add_feature(cartopy.feature.LAND, facecolor='lightgray',zorder=2)
rect = Rectangle(
    (lon1, lat1),  lon2 - lon1,   lat2 - lat1, 
    linewidth=2, edgecolor='black', facecolor='none', transform=ccrs.PlateCarree())
ax.add_patch(rect)

plt.savefig(f'new_eof/fig_ssttau_regress_PC{mode}-{beg_yr}-{end_yr}.png', dpi=300, bbox_inches='tight')
plt.show()

</code></pre>
</details>

<p align="center">
  <img src="/images/post/python-tools/fig_pc1_sst-1900-2000.png" width="45%">
  <img src="/images/post/python-tools/fig_ssttau_regress_PC1-1900-2000.png" width="45%">
</p>

---

## 🌍 Projection examples

<details class="code-toggle">
<summary><strong>PlateCarree (basic projection)</strong></summary>

<pre><code class="language-python">
level = np.arange(-0.04,0.041,0.005)
cmap  = cmaps.BlueDarkRed18

plt.figure(figsize=(10, 6))
ax = plt.axes(projection=ccrs.PlateCarree(central_longitude=180))
ax.coastlines()
ax.add_feature(cartopy.feature.LAND, facecolor='lightgray')
plt.contourf(lon, lat, trend, levels= level,
             cmap=cmap, transform=ccrs.PlateCarree(),extend='both')

cb = plt.colorbar(shrink=0.7,ticks=level[::4])
cb.ax.get_yaxis().set_tick_params(length=0,labelsize=14)
plt.savefig('sst_trend_plate.png',dpi=300,bbox_inches='tight')
plt.show()  
</code></pre>
</details>

<details class="code-toggle">
<summary><strong>Robinson projection</strong></summary>

<pre><code class="language-python">
level = np.arange(-0.04, 0.041, 0.005)
cmap = cmaps.BlueDarkRed18

plt.figure(figsize=(10, 6))

ax = plt.axes(projection=ccrs.Robinson(central_longitude=180))
ax.coastlines()
ax.add_feature(cartopy.feature.LAND, facecolor='lightgray')

plt.contourf(lon, lat, trend, levels=level,
             cmap=cmap, transform=ccrs.PlateCarree(), extend='both')

cb = plt.colorbar(shrink=0.7,ticks=level[::4])
cb.ax.get_yaxis().set_tick_params(length=0,labelsize=14)
  
plt.title('1979-2018 SST trend [K/yr]',fontsize=16,weight='bold')

gl = ax.gridlines(draw_labels=True, xlocs=np.arange(-180, 180, 90), ylocs=np.arange(-90, 91, 30),ls='--')
gl.top_labels = False
gl.xlabel_style = {'size':14}
gl.ylabel_style = {'size':14}

plt.savefig('sst_trend_robin.png',dpi=300,bbox_inches='tight')
plt.show()

</code></pre>
</details>

<details class="code-toggle">
<summary><strong>South Polar projection</strong></summary>

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

## Some useful plot setting
<details class="code-toggle">
<summary><strong>Multi-ticks</strong></summary>

<pre><code class="language-python">
from matplotlib.ticker import MultipleLocator, FormatStrFormatter
  
minor_locator = MultipleLocator(15)
plt.gca().xaxis.set_minor_locator(minor_locator)
plt.xticks(np.arange(135,270.1,45),labels=['135E','180','135W','90W'],fontsize=16,weight='bold')
plt.gca().xaxis.set_tick_params(which='minor', length=5) 
plt.gca().xaxis.set_tick_params(which='major', width=1, length=10)

minor_locator = MultipleLocator(20)
plt.gca().yaxis.set_minor_locator(minor_locator)
plt.yticks(np.arange(0,1000.1,100),fontsize=16,weight='bold')
plt.gca().yaxis.set_tick_params(which='minor', length=5) 
plt.gca().yaxis.set_tick_params(which='major', width=1, length=10)
</code></pre>
</details>

<details class="code-toggle">
<summary><strong>Statistical test</strong></summary>

<pre><code class="language-python">
def linfit(x):
    if np.all(np.isnan(x)):  # 檢查 NaN
        return np.nan, np.nan
    slope, _, _, p_value, _ = linregress(years, x)
    return slope, p_value

trend, p_values = xr.apply_ufunc(
      linfit, 
      u_annual,
      input_core_dims=[['year']],
      output_core_dims=[[], []],  # 分開返回趨勢與 p-value
      vectorize=True)
  
significant = p_values < 0.05
x,y = np.meshgrid(lev, lat) 
x_int, y_int = 20, 1
x,y   = x[::x_int,1::y_int], y[::x_int,1::y_int]
significant_T = significant[1::y_int, ::x_int].T
xx,yy = x[significant_T], y[significant_T]
plt.scatter(yy,xx, color='k', s=15, alpha=0.2)

</code></pre>
</details>

<p align="center">
  <img src="/images/post/psi_Annual_trend.png" alt="PSI trend" width="50%">
</p>

---
## References

Some of the code snippets are adapted or excerpted from the following references, **shared here purely for educational and non-commercial purposes**.  
If you are the original author and prefer not to have your content included, please feel free to contact me and I will remove it promptly. Thank you for your understanding!

- https://nordicesmhub.github.io/NEGI-Abisko-2019/training/example_NorthPolarStereo_projection.html
- https://xeofs.readthedocs.io/en/latest/content/user_guide/quickstart.html
