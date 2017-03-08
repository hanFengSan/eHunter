export function getIntroHtml(introUrl, page) {
    const url = page > 1 ? `${introUrl}?p=${page - 1}` : introUrl;
    return url;
}

export function getImgHtml(baseUrl, pageNum) {
    const url = `${baseUrl}-${pageNum}`;
    return url;
}
