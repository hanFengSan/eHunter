// types and colors of album type
const types = {
    'Doujinshi': '#e74c3c',
    'Manga': '#e67e22',
    'Artist CG': '#f1c40f',
    'Game CG': '#27ae60',
    'Western': '#2ecc71',
    'Non-H': '#3498db',
    'Image Set': '#2980b9',
    'Cosplay': '#9b59b6',
    'Asian Porn': '#8e44ad',
    'Misc': '#bdc3c7',
    'none': '#2c3e50'
};

export default {
    getTypeColor(type) {
      return types[type] || types.none;
    },
    getTypes() {
        return Object.keys(types);
    }
};
