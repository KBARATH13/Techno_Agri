import React, { useState } from 'react';
import './CropsPage.css';
import { useLanguage } from '../../contexts/LanguageContext';
import CropDetailsModal from './CropDetailsModal';

const allCrops = [
  // (All crop data remains the same)
  // Native
  {
    name: 'Paddy', type: 'Food Grains', isNative: true, soilType: 'Clayey Loam', region: 'Cauvery Delta',
    timeToGrow: '120-150 days', minLandSize: '1 acre', waterNeeded: 'High',
    diseases: 'Blast, Sheath Blight', pesticides: 'Tricyclazole, Propiconazole',
    fertilizers: 'NPK, Urea', profitPerAcre: 50000, initialInvestmentPerAcre: 20000, waterNeededPerAcre: 5000,
    imageUrl: 'https://imgs.search.brave.com/e8MkbzeHZzTeNY9VKFT5cDDXGD68BSANzeK5ZtbMZhQ/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly90NC5m/dGNkbi5uZXQvanBn/LzA4LzM0LzM0LzM3/LzM2MF9GXzgzNDM0/Mzc4NF80OGRnRXdM/OXJBY1R2YjlOMWxD/OXBpN2M5TzZwNUpC/TC5qcGc?text=Paddy'
  },
  {
    name: 'Millet', type: 'Food Grains', isNative: true, soilType: 'Sandy Loam', region: 'Drylands',
    timeToGrow: '90-100 days', minLandSize: '1 acre', waterNeeded: 'Low',
    diseases: 'Downy Mildew, Smut', pesticides: 'Mancozeb, Metalaxyl',
    fertilizers: 'FYM, NPK', profitPerAcre: 30000, initialInvestmentPerAcre: 12000, waterNeededPerAcre: 2000,
    imageUrl: 'https://imgs.search.brave.com/dTUCYaO60cFPqlQbonFRzfJe8W0C7Hq8E9qcfr01bBg/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9zdGF0/aWMudmVjdGVlenku/Y29tL3N5c3RlbS9y/ZXNvdXJjZXMvdGh1/bWJuYWlscy8wMTcv/MTY1LzU2MC9zbWFs/bC9yYXctb3JnYW5p/Yy1taWxsZXQtaW4t/YS13b29kZW4tc3Bv/b24tb24tc3Bvb24t/YmFja2dyb3VuZC1j/b25jZXB0LWZvci1o/ZWFsdGh5LWVhdGlu/Zy1zZWxlY3RpdmUt/Zm9jdXMtcGhvdG8u/anBn?text=Millet'
  },
  {
    name: 'Maize', type: 'Food Grains', isNative: true, soilType: 'Alluvial', region: 'Across Tamil Nadu',
    timeToGrow: '90-110 days', minLandSize: '1 acre', waterNeeded: 'Medium',
    diseases: 'Leaf Blight, Stalk Rot', pesticides: 'Carbendazim, Mancozeb',
    fertilizers: 'NPK, Zinc Sulphate', profitPerAcre: 40000, initialInvestmentPerAcre: 15000, waterNeededPerAcre: 3000,
    imageUrl: 'https://imgs.search.brave.com/0H7TrxYrYYGRuX4bzzKF4UJxcApjgYM38W_WGPeJP-0/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly90aHVt/YnMuZHJlYW1zdGlt/ZS5jb20vYi9jb3Ju/ZmllbGQtZ3JlZW4t/bWFpemUtcGxhbnRz/LXN1bi1yYXlzLXNo/aW5pbmctbGVhdmVz/LXN1bmxpZ2h0LWNv/bmNlcHQtZWNvLWZh/cm1pbmctY3VsdGl2/YXRpb24tY3JvcC00/MDUwNzc2NTguanBn?text=Maize'
  },
  {
    name: 'Ragi', type: 'Food Grains', isNative: true, soilType: 'Red Soil', region: 'Across Tamil Nadu',
    timeToGrow: '100-120 days', minLandSize: '1 acre', waterNeeded: 'Low',
    diseases: 'Blast, Foot Rot', pesticides: 'Carbendazim, Tricyclazole',
    fertilizers: 'FYM, NPK', profitPerAcre: 35000, initialInvestmentPerAcre: 14000, waterNeededPerAcre: 2200,
    imageUrl: 'https://imgs.search.brave.com/7GeMaxsrr8GHb8dcowv79cGk0aPzaeeVmQxPpvZgbXo/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly90aHVt/YnMuZHJlYW1zdGlt/ZS5jb20vYi9yYWdp/LWRvc2Etc291dGgt/aW5kaWFuLWZvb2Qt/Y2h1dG5leS00NDM4/MjYyMi5qcGc?text=Ragi'
  },
  {
    name: 'Sorghum', type: 'Food Grains', isNative: true, soilType: 'Black Soil', region: 'Coimbatore, Madurai',
    timeToGrow: '100-110 days', minLandSize: '1 acre', waterNeeded: 'Low',
    diseases: 'Grain Mold, Downy Mildew', pesticides: 'Mancozeb, Metalaxyl',
    fertilizers: 'NPK, Iron Sulphate', profitPerAcre: 32000, initialInvestmentPerAcre: 13000, waterNeededPerAcre: 2100,
    imageUrl: 'https://imgs.search.brave.com/2IilNyo4dJqh-341WfBVow8zakITQlDBtQD5VYl8r2Q/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly93d3cu/dGhlZGFpbHltZWFs/LmNvbS9pbWcvZ2Fs/bGVyeS93aGF0LWlz/LXNvcmdodW0tYW5k/LXdoZXJlLWRvZXMt/aXQtY29tZS1mcm9t/L2hvdy1pcy1pdC1o/YXJ2ZXN0ZWQtMTcw/NjU0MDMxNy5qcGc?text=Sorghum'
  },
  {
    name: 'Sugarcane', type: 'Commercial Crops', isNative: true, soilType: 'Clayey Loam', region: 'All Districts',
    timeToGrow: '10-12 months', minLandSize: '1 acre', waterNeeded: 'High',
    diseases: 'Red Rot, Smut', pesticides: 'Carbendazim, Triadimefon',
    fertilizers: 'NPK, Potash', profitPerAcre: 80000, initialInvestmentPerAcre: 30000, waterNeededPerAcre: 6000,
    imageUrl: 'https://imgs.search.brave.com/gKxXQ5LepLzX-Bd7ZEMhlDnv_34Fpk3ghuNWRy6AbGo/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tZWRp/YS5pc3RvY2twaG90/by5jb20vaWQvMjEy/MzkxMzk2Ni9waG90/by9zdWdhcmNhbmUt/Y3VsdGl2YXRpb24t/YXQtcnVyYWwtZmFy/bS1mcm9tLWRpZmZl/cmVudC1hbmdsZS5q/cGc_Yj0xJnM9NjEy/eDYxMiZ3PTAmaz0y/MCZjPWp6dDhhWkc4/S0laMWpfSzE4RWZw/VWU5WWVZUzZZeEF2/bGVxY1RzMU1GUjA9?text=Sugarcane'
  },
  {
    name: 'Cotton', type: 'Commercial Crops', isNative: true, soilType: 'Black Cotton Soil', region: 'Madurai, Salem',
    timeToGrow: '150-180 days', minLandSize: '1 acre', waterNeeded: 'Medium',
    diseases: 'Bollworm, Whitefly', pesticides: 'Imidacloprid, Acetamiprid',
    fertilizers: 'NPK, Magnesium Sulphate', profitPerAcre: 60000, initialInvestmentPerAcre: 25000, waterNeededPerAcre: 4000,
    imageUrl: 'https://imgs.search.brave.com/Lea5w2H6CG5lQdINHzdqxSJf5L7jI_ut6ju7SCxVeTc/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tZWRp/YS5pc3RvY2twaG90/by5jb20vaWQvMTg0/ODUxODc3L3Bob3Rv/L3Jhdy1jb3R0b24t/Y3JvcHMuanBnP3M9/NjEyeDYxMiZ3PTAm/az0yMCZjPUJQeXNY/bVBKU0FFWG5mMzBE/WDlRMmJ0MGpoRlpa/MXUxelhZYTBQZURW/U1E9?text=Cotton'
  },
  {
    name: 'Coffee', type: 'Plantation Crops', isNative: true, soilType: 'Laterite', region: 'Nilgiris, Kodaikanal',
    timeToGrow: '3-4 years', minLandSize: '1 acre', waterNeeded: 'Medium',
    diseases: 'Leaf Rust, White Stem Borer', pesticides: 'Propiconazole, Chlorpyrifos',
    fertilizers: 'NPK, Lime', profitPerAcre: 100000, initialInvestmentPerAcre: 40000, waterNeededPerAcre: 3500,
    imageUrl: 'https://imgs.search.brave.com/1fHaeq9xD1Sg7VzTtrxjghjaAW691j65QWfoNbI76Ec/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly90aHVt/YnMuZHJlYW1zdGlt/ZS5jb20vYi9mcmVz/aC1ncmVlbi1jb2Zm/ZWUtcGxhbnQtbGVh/dmVzLWFyYWJpY2Et/YmVhbnMtY3VsdGl2/YXRpb24tcGxhbnRh/dGlvbi1ub3J0aGVy/bi10aGFpbGFuZC0y/MDcwNzc5NjQuanBn?text=Coffee'
  },
  {
    name: 'Tea', type: 'Plantation Crops', isNative: true, soilType: 'Laterite', region: 'Nilgiris',
    timeToGrow: '3-5 years', minLandSize: '1 acre', waterNeeded: 'High',
    diseases: 'Blister Blight, Red Spider Mite', pesticides: 'Hexaconazole, Propargite',
    fertilizers: 'NPK, Sulphur', profitPerAcre: 120000, initialInvestmentPerAcre: 50000, waterNeededPerAcre: 5500,
    imageUrl: 'https://imgs.search.brave.com/Ze3loDg1sKnjEB6rHakj2GzqhBIxSsU2Zfv5Z2KPglE/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9pLmV0/c3lzdGF0aWMuY29t/LzMxOTMzODM2L3Iv/aWwvNDEyNzlkLzM4/Njc1NTExMTYvaWxf/NjAweDYwMC4zODY3/NTUxMTE2X29wbjYu/anBn?text=Tea'
  },
  {
    name: 'Mango', type: 'Horticulture Crops', isNative: true, soilType: 'Alluvial', region: 'Krishnagiri, Dindigul',
    timeToGrow: '3-5 years', minLandSize: '1 acre', waterNeeded: 'Medium',
    diseases: 'Anthracnose, Powdery Mildew', pesticides: 'Carbendazim, Sulphur',
    fertilizers: 'NPK, Zinc', profitPerAcre: 90000, initialInvestmentPerAcre: 35000, waterNeededPerAcre: 3200,
    imageUrl: 'https://imgs.search.brave.com/AKu3hZc_bX0G_cQFm8fWoYmW4FMYBAVhqERIotlTuG0/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly93d3cu/aG9saWRpZnkuY29t/L2Jsb2cvd3AtY29u/dGVudC91cGxvYWRz/LzIwMTUvMDcvNjEz/ODQ0NzU2MF9kMzEx/MzgxZTRkX3ouanBn?text=Mango'
  },
  {
    name: 'Banana', type: 'Horticulture Crops', isNative: true, soilType: 'Alluvial', region: 'Trichy, Coimbatore',
    timeToGrow: '9-12 months', minLandSize: '1 acre', waterNeeded: 'High',
    diseases: 'Panama Wilt, Sigatoka Leaf Spot', pesticides: 'Propiconazole, Carbendazim',
    fertilizers: 'NPK, Potash', profitPerAcre: 150000, initialInvestmentPerAcre: 60000, waterNeededPerAcre: 6000,
    imageUrl: 'https://imgs.search.brave.com/0mZWv4Hlk9s7QEpdGOr-TVZtGNhrkuUji_dozOsHT-c/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly90aHVt/YnMuZHJlYW1zdGlt/ZS5jb20vYi9iYW5h/bmEtYnVuY2gtMTk4/MjYzMTYuanBn?text=Banana'
  },
  {
    name: 'Plantain', type: 'Horticulture Crops', isNative: true, soilType: 'Alluvial', region: 'River Valleys',
    timeToGrow: '10-14 months', minLandSize: '1 acre', waterNeeded: 'High',
    diseases: 'Panama Wilt, Sigatoka Leaf Spot', pesticides: 'Propiconazole, Carbendazim',
    fertilizers: 'NPK, Potash', profitPerAcre: 140000, initialInvestmentPerAcre: 55000, waterNeededPerAcre: 5800,
    imageUrl: 'https://imgs.search.brave.com/vCXftd4ftPLDl0Y94_zeZuw_aTKgktNCGhJKZEKCyfw/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly93d3cu/c2h1dHRlcnN0b2Nr/LmNvbS9pbWFnZS1w/aG90by9wbGFudGFp/bi1iYW5hbmEtMjYw/bnctMjY1OTI1NDI2/LmpwZw?text=Plantain'
  },
  {
    name: 'Cashew', type: 'Horticulture Crops', isNative: true, soilType: 'Laterite', region: 'Cuddalore',
    timeToGrow: '3-4 years', minLandSize: '1 acre', waterNeeded: 'Low',
    diseases: 'Tea Mosquito Bug, Anthracnose', pesticides: 'Lambda-Cyhalothrin, Carbendazim',
    fertilizers: 'NPK, Boron', profitPerAcre: 70000, initialInvestmentPerAcre: 28000, waterNeededPerAcre: 2500,
    imageUrl: 'https://imgs.search.brave.com/2g3bu2nQ4wv2GJt2aL_7dzBmlU-9FANfzybZkNjERfM/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9zdGF0/aWMudmVjdGVlenku/Y29tL3N5c3RlbS9y/ZXNvdXJjZXMvdGh1/bWJuYWlscy8wMzIv/MDA3LzQ4MC9zbWFs/bC9jYXNoZXctbnV0/cy10ZXh0dXJlLXBo/b3RvLmpwZw?text=Cashew'
  },
  {
    name: 'Casuarina', type: 'Coastal Crops', isNative: true, soilType: 'Sandy', region: 'Coastal Areas',
    timeToGrow: '4-5 years', minLandSize: '1 acre', waterNeeded: 'Low',
    diseases: 'Wilt, Blister Bark', pesticides: '-',
    fertilizers: '-', profitPerAcre: 25000, initialInvestmentPerAcre: 10000, waterNeededPerAcre: 1800,
    imageUrl: 'https://imgs.search.brave.com/Sx376LAaC_NfD-DU2LB_fHoQOmhHY864jaRKEXJTg9A/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5pc3RvY2twaG90/by5jb20vaWQvMTM5/OTQ1OTQ2Ni9waG90/by9jYXN1YXJpbmEt/Y2xvc2V1cC5qcGc_/cz02MTJ4NjEyJnc9/MCZrPTIwJmM9eS1r/TENndktya1huNkpK/ajFQOEhwRXZtT1Yt/UTU5bHlmckdheDc4/RUc0Zz0?text=Casuarina'
  },
  {
    name: 'Cardamom', type: 'Spices', isNative: true, soilType: 'Laterite', region: 'Western Ghats',
    timeToGrow: '2-3 years', minLandSize: '1 acre', waterNeeded: 'High',
    diseases: 'Azhukal Disease, Capsule Rot', pesticides: 'Mancozeb, Copper Oxychloride',
    fertilizers: 'NPK, Organic Manure', profitPerAcre: 200000, initialInvestmentPerAcre: 80000, waterNeededPerAcre: 5000,
    imageUrl: 'https://imgs.search.brave.com/EEADUMo0U3vFuCKsai8jcskJfe7e04h989t8mNrPdvQ/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tZWRp/YS5nZXR0eWltYWdl/cy5jb20vaWQvMjIw/MjMxMTA5OS9waG90/by9jYXJkYW1vbS5q/cGc_cz02MTJ4NjEy/Jnc9MCZrPTIwJmM9/YnJTT3h5UnctY0hU/VzUxZnBBNDI5N0l2/bFZfOHZpUDd1VjRp/M1NuOFZGdz0?text=Cardamom'
  },
  {
    name: 'Pepper', type: 'Spices', isNative: true, soilType: 'Laterite', region: 'Western Ghats',
    timeToGrow: '3-4 years', minLandSize: '1 acre', waterNeeded: 'Medium',
    diseases: 'Quick Wilt, Anthracnose', pesticides: 'Metalaxyl, Mancozeb',
    fertilizers: 'NPK, Lime', profitPerAcre: 180000, initialInvestmentPerAcre: 70000, waterNeededPerAcre: 3800,
    imageUrl: 'https://imgs.search.brave.com/A3HQjjKBCKaxLif-kAq01R4z37b-Y3kJRq9JnUGjZSA/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9jZG4u/cGl4YWJheS5jb20v/cGhvdG8vMjAxOS8w/OS8yMy8xMS80NC9i/bGFjay1wZXBwZXIt/dGV4dHVyZS00NDk4/MzMwXzY0MC5qcGc?text=Pepper'
  },
  {
    name: 'Turmeric', type: 'Spices', isNative: true, soilType: 'Saline Soil', region: 'Coastal Areas',
    timeToGrow: '7-9 months', minLandSize: '1 acre', waterNeeded: 'Medium',
    diseases: 'Leaf Blotch, Rhizome Rot', pesticides: 'Mancozeb, Metalaxyl',
    fertilizers: 'NPK, FYM', profitPerAcre: 75000, initialInvestmentPerAcre: 30000, waterNeededPerAcre: 3000,
    imageUrl: 'https://imgs.search.brave.com/89H-zPoS0G9J_zo6jAagF__xnCZHpIQt3N5CLr8G8FQ/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tZWRp/YS5pc3RvY2twaG90/by5jb20vaWQvOTc0/NjY0NDM0L3Bob3Rv/L3R1cm1lcmljLXBs/YW50LWJhY2tncm91/bmQtY3VyY3VtYS1w/bGFudC1nZW51cy1j/dXJjdW1hLXBsYW50/LmpwZz9zPTYxMng2/MTImdz0wJms9MjAm/Yz1UTmljNHF1VzNK/VzZKeGU0SFlyVlRm/eXMwSWFPelhJb1Jk/NjdxOXlZZ2x3PQ?text=Turmeric'
  },
  {
    name: 'Coriander', type: 'Spices', isNative: true, soilType: 'Black Soil', region: 'Coimbatore, Madurai',
    timeToGrow: '40-45 days', minLandSize: '0.5 acre', waterNeeded: 'Low',
    diseases: 'Powdery Mildew, Wilt', pesticides: 'Sulphur, Carbendazim',
    fertilizers: 'NPK, FYM', profitPerAcre: 25000, initialInvestmentPerAcre: 10000, waterNeededPerAcre: 1500,
    imageUrl: 'https://imgs.search.brave.com/VxRR1SqSCzVygl_8kIsbcu7_wi5rcsrUaRLtpq42jdY/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tZWRp/YS5pc3RvY2twaG90/by5jb20vaWQvMjE2/NDQxNDM1NS9waG90/by9ncmVlbi1mcmVz/aC1jb3JpYW5kZXIt/bGVhdmVzLWNvcmlh/bmRlci1ncm93aW5n/LWluLXRoZS1nYXJk/ZW4tbmF0dXJhbC1i/YWNrZ3JvdW5kLmpw/Zz9zPTYxMng2MTIm/dz0wJms9MjAmYz1O/TlMzYzIwMWFELWYy/VmdXVm1INzA0cnNf/TnZHMkZ3WDhzNjlV/alh0VTI4PQ?text=Coriander'
  },
  {
    name: 'Brinjal', type: 'Vegetables', isNative: true, soilType: 'Alluvial', region: 'Across Tamil Nadu',
    timeToGrow: '100-140 days', minLandSize: '0.5 acre', waterNeeded: 'Medium',
    diseases: 'Fruit and Shoot Borer, Little Leaf', pesticides: 'Emamectin Benzoate, Imidacloprid',
    fertilizers: 'NPK, Potash', profitPerAcre: 60000, initialInvestmentPerAcre: 22000, waterNeededPerAcre: 2800,
    imageUrl: 'https://imgs.search.brave.com/e9JLO7Q6UCaTGJ0sHv5Wg4XoxyUb007DUwtkyi-g19I/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9hZ3Jp/dGVjaC50bmF1LmFj/LmluL2Nyb3BfcHJv/dGVjdGlvbi9icmlu/amFsbWFpbjEucG5n?text=Brinjal'
  },
  {
    name: 'Tomato', type: 'Vegetables', isNative: true, soilType: 'Alluvial', region: 'Across Tamil Nadu',
    timeToGrow: '90-120 days', minLandSize: '0.5 acre', waterNeeded: 'Medium',
    diseases: 'Early Blight, Late Blight', pesticides: 'Mancozeb, Chlorothalonil',
    fertilizers: 'NPK, Calcium Nitrate', profitPerAcre: 65000, initialInvestmentPerAcre: 25000, waterNeededPerAcre: 3000,
    imageUrl: 'https://imgs.search.brave.com/ny-kxmIktQGcOkH7xSHqlUpX6Rhw23yhqRiJn5hXyPs/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWFn/ZXMudW5zcGxhc2gu/Y29tL3Bob3RvLTE1/NjUxOTUwOTM0Njkt/ODJhNGE0ZDAwZWQ3/P2l4bGliPXJiLTQu/MS4wJml4aWQ9TTN3/eE1qQTNmREI4TUh4/elpXRnlZMmg4TVRK/OGZIUnZiV0YwYnlV/eU1IQnNZVzUwZkdW/dWZEQjhmREI4Zkh3/dyZmbT1qcGcmcT02/MCZ3PTMwMDA?text=Tomato'
  },
  {
    name: 'Black Gram', type: 'Pulses', isNative: true, soilType: 'Saline Soil', region: 'Coastal Areas',
    timeToGrow: '80-90 days', minLandSize: '1 acre', waterNeeded: 'Low',
    diseases: 'Yellow Mosaic Virus, Powdery Mildew', pesticides: 'Imidacloprid, Sulphur',
    fertilizers: 'NPK, Rhizobium', profitPerAcre: 28000, initialInvestmentPerAcre: 11000, waterNeededPerAcre: 1800,
    imageUrl: 'https://imgs.search.brave.com/Z-VLG6NXH4ko9woOMIQi9uA3MGJEqi7AQevJp1qvhcM/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9vb29m/YXJtcy5jb20vY2Ru/L3Nob3AvcHJvZHVj/dHMvVXJhZF9XaG9s/ZS5qcGc_dj0xNzM2/NzQ0NDUyJndpZHRo/PTM4NDA?text=Black+Gram'
  },
  {
    name: 'Green Gram', type: 'Pulses', isNative: true, soilType: 'Saline Soil', region: 'Coastal Areas',
    timeToGrow: '70-80 days', minLandSize: '1 acre', waterNeeded: 'Low',
    diseases: 'Yellow Mosaic Virus, Powdery Mildew', pesticides: 'Imidacloprid, Sulphur',
    fertilizers: 'NPK, Rhizobium', profitPerAcre: 27000, initialInvestmentPerAcre: 10000, waterNeededPerAcre: 1700,
    imageUrl: 'https://imgs.search.brave.com/PpCGJNO-pK_whWouyY6v7XvCleAOT6IoqEznLvN_NKE/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9zYWZp/b3JnYW5pY3MuY28u/a2Uvd3AtY29udGVu/dC91cGxvYWRzLzIw/MjIvMDcvZ3JlZW4t/Z3JhbS0yNTB4MjUw/LTEud2VicA?text=Green+Gram'
  },
  {
    name: 'Groundnut', type: 'Oilseeds', isNative: true, soilType: 'Red Soil', region: 'Across Tamil Nadu',
    timeToGrow: '100-130 days', minLandSize: '1 acre', waterNeeded: 'Medium',
    diseases: 'Tikka Leaf Spot, Rust', pesticides: 'Mancozeb, Hexaconazole',
    fertilizers: 'NPK, Gypsum', profitPerAcre: 45000, initialInvestmentPerAcre: 18000, waterNeededPerAcre: 3000,
    imageUrl: 'https://imgs.search.brave.com/weBaZbZ_42X-uMo6E9YHOL5hvrzoee_QrtGSjVpBi0w/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/YWdyaWZhcm1pbmcu/aW4vd3AtY29udGVu/dC91cGxvYWRzL1Vu/bG9jay10aGUtU2Vj/cmV0cy1vZi1Hcm91/bmRudXQtRmFybWlu/Zy01LmpwZw?text=Groundnut'
  },
  {
    name: 'Sunflower', type: 'Oilseeds', isNative: true, soilType: 'Black Soil', region: 'Coimbatore, Madurai',
    timeToGrow: '90-100 days', minLandSize: '1 acre', waterNeeded: 'Medium',
    diseases: 'Downy Mildew, Rust', pesticides: 'Metalaxyl, Mancozeb',
    fertilizers: 'NPK, Boron', profitPerAcre: 40000, initialInvestmentPerAcre: 16000, waterNeededPerAcre: 2800,
    imageUrl: 'https://imgs.search.brave.com/4T6ZGrKvQ5gd57PHnJOcQeDecPOel9HqaGdL2uSlj3E/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly90aHVt/YnMuZHJlYW1zdGlt/ZS5jb20vYi9zdW5m/bG93ZXItZmllbGQt/cmlwZS1wbGFudHMt/cmVhZHktaGFydmVz/dC1zdW1tZXItd2lk/ZS12aWV3LW1hdHVy/ZS1oYXJ2ZXN0aW5n/LWNvbmNlcHQtYWdy/aWN1bHR1cmUtZmFy/bWluZy1lY29sb2d5/LTM5ODE1OTQyOS5q/cGc?text=Sunflower'
  },
  {
    name: 'Wheat', type: 'Food Grains', isNative: false, soilType: 'Loamy', region: 'Limited Areas',
    timeToGrow: '120-140 days', minLandSize: '1 acre', waterNeeded: 'Medium',
    diseases: 'Rust, Powdery Mildew', pesticides: 'Propiconazole, Tebuconazole',
    fertilizers: 'NPK, Urea', profitPerAcre: 25000, initialInvestmentPerAcre: 12000, waterNeededPerAcre: 2500,
    imageUrl: 'https://imgs.search.brave.com/X6VaMYwzldDbHN9hIjbT9k3eBoNs2-S8D3BirvkA0o0/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9jZG4u/c2hvcGlmeS5jb20v/cy9maWxlcy8xLzAw/NjEvMTM5MS85MDg5/L2ZpbGVzL1NlbGVj/dGl2ZV9Gb2N1c19Q/aG90b2dyYXBoeV9v/Zl9XaGVhdF9GaWVs/ZF80ODB4NDgwLmpw/Zz92PTE3MjE3Mjg5/NDc?text=Wheat'
  },
  {
    name: 'Tobacco', type: 'Commercial Crops', isNative: false, soilType: 'Sandy Loam', region: 'Dindigul, Vellore',
    timeToGrow: '90-100 days', minLandSize: '1 acre', waterNeeded: 'Medium',
    diseases: 'Mosaic Virus, Black Shank', pesticides: 'Imidacloprid, Metalaxyl',
    fertilizers: 'NPK, Potash', profitPerAcre: 70000, initialInvestmentPerAcre: 30000, waterNeededPerAcre: 3200,
    imageUrl: 'https://imgs.search.brave.com/wbQg3uP_xZ6aotz95CavO_8iGyV23PGarDvHZn7YJa4/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tcmdz/Y2lnYXJzLmNvbS93/cC1jb250ZW50L3Vw/bG9hZHMvMjAyMy8x/MS90b2JhY2NvLWhh/cnZlc3RpbmctMi0x/MDI0eDY4My5qcGc?text=Tobacco'
  },
  {
    name: 'Rubber', type: 'Plantation Crops', isNative: false, soilType: 'Laterite', region: 'Kanyakumari',
    timeToGrow: '7 years', minLandSize: '1 acre', waterNeeded: 'High',
    diseases: 'Abnormal Leaf Fall, Powdery Mildew', pesticides: 'Mancozeb, Sulphur',
    fertilizers: 'NPK, Magnesium', profitPerAcre: 85000, initialInvestmentPerAcre: 40000, waterNeededPerAcre: 5000,
    imageUrl: 'https://imgs.search.brave.com/60fFgocfBF1Ck2mdszzfeSGXiikAnu9xHs03Zl8P3Wg/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jZG4u/Y3JlYXRlLnZpc3Rh/LmNvbS9hcGkvbWVk/aWEvc21hbGwvNDE0/OTQ3NjI4L3N0b2Nr/LXBob3RvLXZpZXRu/YW0tcnViYmVyLXRy/ZWUtdGFwcGluZy1s/YXRleC1ydWJiZXIt/bGF0ZXgtZXh0cmFj/dGVkLXJ1YmJlci10/cmVl?text=Rubber'
  },
  {
    name: 'Apple', type: 'Horticulture Crops', isNative: false, soilType: 'Loamy', region: 'Kodaikanal (High Altitude)',
    timeToGrow: '4-5 years', minLandSize: '1 acre', waterNeeded: 'Medium',
    diseases: 'Scab, Powdery Mildew', pesticides: 'Carbendazim, Sulphur',
    fertilizers: 'NPK, Boron', profitPerAcre: 120000, initialInvestmentPerAcre: 50000, waterNeededPerAcre: 3500,
    imageUrl: 'https://imgs.search.brave.com/bIbZFXjBNDhMElAQKxThhNDzDk_dxe92T7bAEfnArE4/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly93d3cu/dGhlc2lsbC5jb20v/Y2RuL3Nob3AvYXJ0/aWNsZXMvRnVqaV9B/cHBsZV9UcmVlX0Ns/b3NlLnBuZz92PTE3/NDg1NTMwNzYmd2lk/dGg9MTEwMA?text=Apple'
  },
  {
    name: 'Orange', type: 'Horticulture Crops', isNative: false, soilType: 'Loamy', region: 'Kodaikanal (High Altitude)',
    timeToGrow: '3-4 years', minLandSize: '1 acre', waterNeeded: 'Medium',
    diseases: 'Citrus Canker, Greening', pesticides: 'Copper Oxychloride, Imidacloprid',
    fertilizers: 'NPK, Zinc', profitPerAcre: 110000, initialInvestmentPerAcre: 45000, waterNeededPerAcre: 3300,
    imageUrl: 'https://imgs.search.brave.com/k-y5JyYt9j1FfkTzDI6ZnaWtEp5nMW86i7qePsUGFfc/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9jcm9w/bGlicmFyeS5jb20v/d3AtY29udGVudC91/cGxvYWRzLzIwMjUv/MDMvdmVjdGVlenlf/dGFuZ2VyaW5lLXBp/Y2tpbmctaW4tdGhl/LWdhcmRlbi1mb3It/YmFja2dyb3VuZF8z/NTUwOTkyNy0xMDI0/eDY4NC5qcGc?text=Orange'
  },
  {
    name: 'Clove', type: 'Spices', isNative: false, soilType: 'Laterite', region: 'Nilgiris, Kanyakumari',
    timeToGrow: '4-5 years', minLandSize: '1 acre', waterNeeded: 'High',
    diseases: 'Leaf Spot, Stem Borer', pesticides: 'Carbendazim, Chlorpyrifos',
    fertilizers: 'NPK, Organic Manure', profitPerAcre: 250000, initialInvestmentPerAcre: 100000, waterNeededPerAcre: 5200,
    imageUrl: 'https://imgs.search.brave.com/rI6vRUPnFEhWx9jFG3cOXQqvhdSLDjHEH7FN9lhIEWM/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tb25j/aHluYXR1cmFscHJv/ZHVjdHMuY29tL3dw/LWNvbnRlbnQvdXBs/b2Fkcy8yMDIzLzAx/L0NMT1ZFUy1DTE9T/RS1VUFMtbWluLXNj/YWxlZC5qcGc?text=Clove'
  },
  {
    name: 'Broccoli', type: 'Vegetables', isNative: false, soilType: 'Loamy', region: 'Ooty, Kodaikanal',
    timeToGrow: '70-100 days', minLandSize: '0.5 acre', waterNeeded: 'Medium',
    diseases: 'Downy Mildew, Black Rot', pesticides: 'Mancozeb, Copper Hydroxide',
    fertilizers: 'NPK, Boron', profitPerAcre: 55000, initialInvestmentPerAcre: 20000, waterNeededPerAcre: 2700,
    imageUrl: 'https://imgs.search.brave.com/7OMfWmNAJyMYz4LT1RhM-5fSMFmqed43jCtjprcFatA/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly93d3cu/bWFydGhhc3Rld2Fy/dC5jb20vdGhtYi9V/ZGFaQXlXUHZoYU4z/Sk4wcXBQM21kc3dy/c2s9LzMwMHgyMDAv/ZmlsdGVyczpub191/cHNjYWxlKCk6bWF4/X2J5dGVzKDE1MDAw/MCk6c3RyaXBfaWNj/KCkvc3VtbWVyLXBs/YW50cy1icm9jY29s/aS1hMzUxZTE1NzUw/Y2Y0ZGYyODNiOGY1/ODI2NWQ1OGY4Ni5q/cGc?text=Broccoli'
  },
  {
    name: 'Celery', type: 'Vegetables', isNative: false, soilType: 'Loamy', region: 'Ooty, Kodaikanal',
    timeToGrow: '85-120 days', minLandSize: '0.5 acre', waterNeeded: 'High',
    diseases: 'Late Blight, Celery Mosaic Virus', pesticides: 'Mancozeb, Imidacloprid',
    fertilizers: 'NPK, Calcium', profitPerAcre: 50000, initialInvestmentPerAcre: 18000, waterNeededPerAcre: 3000,
    imageUrl: 'https://imgs.search.brave.com/nnsOvm6B4hxsxL7UVKhGVDFM3Rx4Ndt4jHCUT7O4tHQ/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/bmF0dXJlLWFuZC1n/YXJkZW4uY29tL3dw/LWNvbnRlbnQvdXBs/b2Fkcy9zaXRlcy80/LzIwMjEvMTIvY2Vs/ZXJ5LTEwMjR4NzY4/LmpwZw?text=Celery'
  },
  {
    name: 'Barley', type: 'Food Grains', isNative: true, soilType: 'Loamy', region: 'Across Tamil Nadu',
    timeToGrow: '90-120 days', minLandSize: '1 acre', waterNeeded: 'Medium',
    diseases: 'Rust, Powdery Mildew', pesticides: 'Propiconazole, Tebuconazole',
    fertilizers: 'NPK, Urea', profitPerAcre: 28000, initialInvestmentPerAcre: 12000, waterNeededPerAcre: 2500,
    imageUrl: 'https://imgs.search.brave.com/SOXHXU5DQwaXdYLr5rIXkMN4nKjdY1qQ2MZ20aJ5Kwo/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9lb3Mu/Y29tL3dwLWNvbnRl/bnQvdXBsb2Fkcy8y/MDIzLzEyL2dyb3dp/bmctYmFybGV5LnBu/Zy53ZWJw'
  },
  {
    name: 'Castor', type: 'Oilseeds', isNative: true, soilType: 'Sandy Loam', region: 'Across Tamil Nadu',
    timeToGrow: '150-180 days', minLandSize: '1 acre', waterNeeded: 'Low',
    diseases: 'Capsule Borer, Wilt', pesticides: 'Chlorpyrifos, Carbendazim',
    fertilizers: 'NPK, FYM', profitPerAcre: 35000, initialInvestmentPerAcre: 15000, waterNeededPerAcre: 2000,
    imageUrl: 'https://imgs.search.brave.com/du76Szp4IkN4mgHhcuCjLC6U4pCG1SnCu4_2d7xnVfo/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9zdGF0/aWMudmVjdGVlenku/Y29tL3N5c3RlbS9y/ZXNvdXJjZXMvdGh1/bWJuYWlscy8wNTIv/MTgzLzc5NC9zbWFs/bC90aG9ybnktY2Fz/dG9yLWJlYW5zLWF0/dGFjaGVkLXRvLXRo/ZS1zbWFsbC1zdGVt/LXBob3RvLmpwZw'
  },
  {
    name: 'Chickpea', type: 'Pulses', isNative: true, soilType: 'Black Soil', region: 'Across Tamil Nadu',
    timeToGrow: '90-100 days', minLandSize: '1 acre', waterNeeded: 'Low',
    diseases: 'Wilt, Pod Borer', pesticides: 'Imidacloprid, Carbendazim',
    fertilizers: 'NPK, Rhizobium', profitPerAcre: 30000, initialInvestmentPerAcre: 12000, waterNeededPerAcre: 1800,
    imageUrl: 'https://imgs.search.brave.com/swcJchwmMJArsf5GGxFFMBmIeNB8Trofn0GxLqVXZ2g/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9zdGF0/aWMudmVjdGVlenku/Y29tL3N5c3RlbS9y/ZXNvdXJjZXMvdGh1/bWJuYWlscy8wMzgv/NzA1LzE3NS9zbWFs/bC9haS1nZW5lcmF0/ZWQtY2hpY2twZWFz/LWlzb2xhdGVkLWtp/dGNoZW4tdGFibGUt/cHJvZmVzc2lvbmFs/LWFkdmVydGlzaW5n/LWZvb2RncmFwaHkt/cGhvdG8uanBn'
  },
  {
    name: 'Fodder', type: 'Fodder Crops', isNative: true, soilType: 'Various', region: 'Across Tamil Nadu',
    timeToGrow: '60-90 days', minLandSize: '0.5 acre', waterNeeded: 'Medium',
    diseases: '-', pesticides: '-',
    fertilizers: 'FYM, Urea', profitPerAcre: 15000, initialInvestmentPerAcre: 5000, waterNeededPerAcre: 2000,
    imageUrl: 'https://imgs.search.brave.com/EdhjbkhN3K6g9Pqb5qR4cNgbsMSPuyz-wXccgvL7E1k/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pMC53/cC5jb20vY2x1Y2tp/bmdpdHVwLmNvbS93/cC1jb250ZW50L3Vw/bG9hZHMvMjAxNi8w/Mi9JTUdfMjAxNjAy/MTFfMTcyODE1Njkw/LmpwZz9yZXNpemU9/NDg1LDI3Mw'
  },
  {
    name: 'Linseed', type: 'Oilseeds', isNative: true, soilType: 'Clayey Loam', region: 'Across Tamil Nadu',
    timeToGrow: '120-150 days', minLandSize: '1 acre', waterNeeded: 'Medium',
    diseases: 'Rust, Powdery Mildew', pesticides: 'Mancozeb, Sulphur',
    fertilizers: 'NPK, Boron', profitPerAcre: 32000, initialInvestmentPerAcre: 14000, waterNeededPerAcre: 2500,
    imageUrl: 'https://imgs.search.brave.com/w_WgydGpAfa2K22_YB_WXwLqEJAX8ADIW3AwhCdJ89E/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jZG4u/cGl4YWJheS5jb20v/cGhvdG8vMjAxOC8w/OC8xNS8xNi8yNy9m/bGF4LTM2MDg0ODdf/NjQwLmpwZw'
  },
  {
    name: 'Onion', type: 'Vegetables', isNative: true, soilType: 'Sandy Loam', region: 'Across Tamil Nadu',
    timeToGrow: '90-120 days', minLandSize: '0.5 acre', waterNeeded: 'Medium',
    diseases: 'Downy Mildew, Purple Blotch', pesticides: 'Mancozeb, Chlorothalonil',
    fertilizers: 'NPK, Sulphur', profitPerAcre: 50000, initialInvestmentPerAcre: 20000, waterNeededPerAcre: 2500,
    imageUrl: 'https://imgs.search.brave.com/k0_GuJNTPbRy5B-2gFUI6kK175yI_AGVtaG0SFDHndA/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5pc3RvY2twaG90/by5jb20vaWQvMTI2/MjMwMjU3Ni9waG90/by9jb3VwbGUtb2Yt/b25pb25zLWluLWRp/cnQtZ3Jvd2luZy5q/cGc_cz02MTJ4NjEy/Jnc9MCZrPTIwJmM9/czFwQXBxYkFMMjNV/VldjYU5MU3lMa3B3/eUlTdnY2MW1ZTlFL/NU82YjJEYz0'
  },
  {
    name: 'Pigeonpea', type: 'Pulses', isNative: true, soilType: 'Red Soil', region: 'Across Tamil Nadu',
    timeToGrow: '150-180 days', minLandSize: '1 acre', waterNeeded: 'Low',
    diseases: 'Wilt, Pod Borer', pesticides: 'Imidacloprid, Carbendazim',
    fertilizers: 'NPK, Rhizobium', profitPerAcre: 38000, initialInvestmentPerAcre: 15000, waterNeededPerAcre: 2200,
    imageUrl: 'https://imgs.search.brave.com/Rsg6ZjeMjrT4z89QxfPGJeffwi8JWbH09JtFHSRivjo/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly90My5m/dGNkbi5uZXQvanBn/LzAyLzg5Lzc2Lzk4/LzM2MF9GXzI4OTc2/OTg4N19SSTRVU0VN/bXpoV3FqOHExRG9w/RjhCSnozNFJhZ1E0/eS5qcGc'
  },
  {
    name: 'Potatoe', type: 'Vegetables', isNative: true, soilType: 'Sandy Loam', region: 'Ooty, Kodaikanal',
    timeToGrow: '90-120 days', minLandSize: '0.5 acre', waterNeeded: 'Medium',
    diseases: 'Early Blight, Late Blight', pesticides: 'Mancozeb, Chlorothalonil',
    fertilizers: 'NPK, Potash', profitPerAcre: 60000, initialInvestmentPerAcre: 25000, waterNeededPerAcre: 3000,
    imageUrl: 'https://imgs.search.brave.com/Cd0tvacZutls59dxltUIpvi5XDKyH5KPkbP8N26L-Yk/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90My5m/dGNkbi5uZXQvanBn/LzE1LzgzLzIyLzY4/LzM2MF9GXzE1ODMy/MjY4NjRfZDlENDVo/bE5WRjVXT2s2T1hB/aDduWmxSVGZrbWdW/dWkuanBn'
  },
  {
    name: 'Rice', type: 'Food Grains', isNative: true, soilType: 'Clayey Loam', region: 'Cauvery Delta',
    timeToGrow: '120-150 days', minLandSize: '1 acre', waterNeeded: 'High',
    diseases: 'Blast, Sheath Blight', pesticides: 'Tricyclazole, Propiconazole',
    fertilizers: 'NPK, Urea', profitPerAcre: 50000, initialInvestmentPerAcre: 20000, waterNeededPerAcre: 5000,
    imageUrl: 'https://imgs.search.brave.com/7XH78CbxYRMPiX-ps1wCzpw33C3dscpWcZslNMmL6EI/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tZWRp/YS5nZXR0eWltYWdl/cy5jb20vaWQvMTE4/MzU2MDg1OC9waG90/by9lYXItb2Ytcmlj/ZS5qcGc_cz02MTJ4/NjEyJnc9MCZrPTIw/JmM9YXhMWGNKakdy/UTR3TUZwZVo4bEU3/MVFIZlh0Mm5BYlZM/eG9zVldoNFpFTT0'
  },
  {
    name: 'Safflower', type: 'Oilseeds', isNative: true, soilType: 'Black Soil', region: 'Across Tamil Nadu',
    timeToGrow: '120-150 days', minLandSize: '1 acre', waterNeeded: 'Low',
    diseases: 'Rust, Powdery Mildew', pesticides: 'Mancozeb, Sulphur',
    fertilizers: 'NPK, Boron', profitPerAcre: 30000, initialInvestmentPerAcre: 13000, waterNeededPerAcre: 2000,
    imageUrl: 'https://imgs.search.brave.com/2zQRQKl3RsBs8BloY5IggGcBWkMbt5Gt9KzBT0ZMQe0/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly95YXJh/dXJsLm5ldC95Nndn'
  },
  {
    name: 'Sesame', type: 'Oilseeds', isNative: true, soilType: 'Sandy Loam', region: 'Across Tamil Nadu',
    timeToGrow: '80-90 days', minLandSize: '1 acre', waterNeeded: 'Low',
    diseases: 'Phyllody, Leaf Spot', pesticides: 'Imidacloprid, Mancozeb',
    fertilizers: 'NPK, FYM', profitPerAcre: 28000, initialInvestmentPerAcre: 11000, waterNeededPerAcre: 1700,
    imageUrl: 'https://imgs.search.brave.com/VgK8H9_HvdbhASVm3teIZ16tEikGdIqLdIbewCjvKV4/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tZWRp/YS5nZXR0eWltYWdl/cy5jb20vaWQvMTA5/MzY3NjI1NC9waG90/by9tYWNyby12aWV3/LW9mLXNlc2FtZS1z/ZWVkcy1vbi13b29k/ZW4tc3Bvb24uanBn/P3M9NjEyeDYxMiZ3/PTAmaz0yMCZjPXhh/UERyRHR1V2xabjdS/TGJSR0hyRHdOc004/Z2l1OVN6MlhXYTAy/c3VGcmM9'
  },
  {
    name: 'Soyabean', type: 'Pulses', isNative: true, soilType: 'Black Soil', region: 'Across Tamil Nadu',
    timeToGrow: '90-120 days', minLandSize: '1 acre', waterNeeded: 'Medium',
    diseases: 'Rust, Yellow Mosaic Virus', pesticides: 'Mancozeb, Imidacloprid',
    fertilizers: 'NPK, Rhizobium', profitPerAcre: 40000, initialInvestmentPerAcre: 16000, waterNeededPerAcre: 2500,
    imageUrl: 'https://imgs.search.brave.com/x1k5gGvGeBfA2yzi76lvq_UG9-oSZMdnmVtOxafWw74/rs:fit:0:180:1:0/g:ce/aHR0cHM6Ly9pbmRp/YWFncm9uZXQuY29t/L2luZGlhYWdyb25l/dC9JbWFnZXMvc295/YWJlYW4uanBn'
  },
];

const CropsPage = () => {
  const [cropTypeFilter, setCropTypeFilter] = useState('All');
  const [soilTypeFilter, setSoilTypeFilter] = useState('All');
  const [regionFilter, setRegionFilter] = useState('All');
  const [nativeFilter, setNativeFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCrop, setSelectedCrop] = useState(null);
  const { translate } = useLanguage();

  const openModal = (crop) => {
    setSelectedCrop(crop);
  };

  const cropTypes = ['All', ...new Set(allCrops.map(crop => crop.type))];
  const soilTypes = ['All', ...new Set(allCrops.map(crop => crop.soilType))];
  const regions = ['All', ...new Set(allCrops.map(crop => crop.region))];

  const handleDropdownClick = (e) => {
    window.scrollTo({
      top: 180,
      behavior: 'smooth'
    });
  };

  const filteredCrops = allCrops.filter(crop => {
    return (
      (crop.name.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (cropTypeFilter === 'All' || crop.type === cropTypeFilter) &&
      (soilTypeFilter === 'All' || crop.soilType === soilTypeFilter) &&
      (regionFilter === 'All' || crop.region === regionFilter) &&
      (nativeFilter === 'All' || String(crop.isNative) === nativeFilter)
    );
  });

  return (
    <div className="crops-page">
      <h1>{translate('crops_information')}</h1>
      <div className="filters">
        <input
          type="text"
          placeholder={translate('search_for_crop_placeholder')}
          className="search-bar"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <div className="filter-group">
          <label>{translate('crop_type')}</label>
          <select value={cropTypeFilter} onChange={e => setCropTypeFilter(e.target.value)} onMouseDown={handleDropdownClick}>
            {cropTypes.map(type => <option key={type} value={type}>{type === 'All' ? translate('all') : translate(type)}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <label>{translate('soil_type')}</label>
          <select value={soilTypeFilter} onChange={e => setSoilTypeFilter(e.target.value)} onMouseDown={handleDropdownClick}>
            {soilTypes.map(type => <option key={type} value={type}>{type === 'All' ? translate('all') : translate(type)}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <label>{translate('region')}</label>
          <select value={regionFilter} onChange={e => setRegionFilter(e.target.value)} onMouseDown={handleDropdownClick}>
            {regions.map(type => <option key={type} value={type}>{type === 'All' ? translate('all') : translate(type)}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <label>{translate('origin')}</label>
          <select value={nativeFilter} onChange={e => setNativeFilter(e.target.value)} onMouseDown={handleDropdownClick}>
            <option value="All">{translate('all')}</option>
            <option value="true">{translate('native')}</option>
            <option value="false">{translate('non_native')}</option>
          </select>
        </div>
      </div>
      <div className="crops-grid">
        {filteredCrops.map(crop => (
          <div key={crop.name} className="crop-item modern-card" onClick={() => openModal(crop)}>
            <h4>{translate(crop.name)}</h4>
            <div className="crop-image-container">
              <img src={crop.imageUrl} alt={crop.name} />
            </div>
          </div>
        ))}
      </div>
      <CropDetailsModal crop={selectedCrop} onClose={() => setSelectedCrop(null)} />
    </div>
  );
};

export default CropsPage;

