// colors of album type
export default {
    _typeColors: {
        'Doujishi': '#e74c3c',
        'Manga': '#e67e22',
        'Artist-CG': '#f1c40f',
        'Game-CG': '#27ae60',
        'Western': '#2ecc71',
        'Non-H': '#3498db',
        'Image-Set': '#2980b9',
        'Cosplay': '#9b59b6',
        'Asian-Porn': '#8e44ad',
        'Misc': '#bdc3c7',
        'none': '#2c3e50'
    },
    getColorByType(type) {
        if (type !== '' && this._typeColors.hasOwnProperty(type)) {
            return this._typeColors[type];
        } else {
            return this._typeColors.none;
        }
    }
};
