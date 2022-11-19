export function getIntroHtml(introUrl: string, page: number): string {
    const url = page > 1 ? `${introUrl}?p=${page - 1}` : introUrl;
    return url;
}

export function getImgHtml(baseUrl: string, pageNum: number): string {
    const url = `${baseUrl}-${pageNum}`;
    return url;
}
