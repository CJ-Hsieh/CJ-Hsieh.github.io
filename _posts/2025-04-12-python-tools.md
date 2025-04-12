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

<details>

<summary><strong>Walker circulation</strong></summary>

```python
# Walker circulation example code
import xarray as xr
import numpy as np

# Placeholder for walker cell diagnostics
print("Walker circulation diagnostics complete")
```
</details> 


<details>
<summary><strong>Atmospheric data - Hadley circulation</strong></summary>

```python
  
import xarray as xr
import numpy as np
```

</details> 
<p align="center">
  <img src="/images/post/python-tools/fig_hadley_cell.png" alt="Hadley cell" width="50%">
</p>

## Oceanic data
<details>

<summary><strong>Oceanic data - Regrid</strong></summary>

```python
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
```

</details>

<details> 
  
<summary><strong>Oceanic data - SST trend</strong></summary>

```python
# Calculate SST trend over time
import xarray as xr
import numpy as np

ds = xr.open_dataset('/your_path/xxxx_pop.h.1850-01.nc')
sst = ds['TEMP'].isel(z_t=0)
```

</details>




