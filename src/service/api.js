// export function getIntroHtml(introUrl, page) {
//   const url = page > 1 ? `${introUrl}?p=${page - 1}` : introUrl;
//   return fetch(url, {
//     method: 'GET',
//     credentials: 'include'
//   });
// }

// export function getImgHtml(baseUrl, pageNum) {
//   const url = `${baseUrl}-${pageNum}`;
//   return fetch(url, {
//     method: 'GET',
//     credentials: 'include'
//   });
// }

export function getIntroHtml(introUrl, page) {
    const url = page > 1 ? `${introUrl}?p=${page - 1}` : introUrl;
    return url;
}

export function getImgHtml(baseUrl, pageNum) {
    const url = `${baseUrl}-${pageNum}`;
    return url;
}