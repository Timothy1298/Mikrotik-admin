function r(t){if(t===0)return"0 B";const n=["B","KB","MB","GB","TB"],o=Math.floor(Math.log(t)/Math.log(1024));return`${(t/1024**o).toFixed(2)} ${n[o]}`}export{r as f};
