const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.PORT || 3000);
const PUBLIC_DIR = path.join(__dirname, "public");

const contentTypes = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon"
};

function send(res, status, body, headers = {}) {
    res.writeHead(status, headers);
    res.end(body);
}

function resolvePublicPath(urlPath) {
    const cleanPath = decodeURIComponent(urlPath.split("?")[0]);
    const requestedPath = cleanPath === "/" ? "/index.html" : cleanPath;
    const filePath = path.normalize(path.join(PUBLIC_DIR, requestedPath));

    if (!filePath.startsWith(PUBLIC_DIR)) {
        return null;
    }

    return filePath;
}

const server = http.createServer((req, res) => {
    if (!req.url || req.method !== "GET") {
        send(res, 405, "Method Not Allowed", { "Content-Type": "text/plain; charset=utf-8" });
        return;
    }

    const filePath = resolvePublicPath(req.url);

    if (!filePath) {
        send(res, 403, "Forbidden", { "Content-Type": "text/plain; charset=utf-8" });
        return;
    }

    fs.readFile(filePath, (error, content) => {
        if (error) {
            send(res, 404, "Not Found", { "Content-Type": "text/plain; charset=utf-8" });
            return;
        }

        const extension = path.extname(filePath).toLowerCase();
        send(res, 200, content, {
            "Content-Type": contentTypes[extension] || "application/octet-stream",
            "Cache-Control": extension === ".html" ? "no-cache" : "public, max-age=3600"
        });
    });
});

server.listen(PORT, () => {
    console.log(`Movie Search App is running at http://localhost:${PORT}`);
});
