import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
let headers = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET" };

const port = Number(Deno.env.get("PORT")) || 3000;
const hostname = Deno.env.get("IP") || "::";

serve(async request => {
    const path = new URL(request.url).pathname;

    if (path === "/") {
        return Response.redirect("https://github.com/ESCFent/EurovisionVODs/tree/main/api", 307);
    } else if (path === "/favicon.ico") {
        return new Response(null, { status: 200, headers });
    } else if (path.split("/").length >= 3) {
        let service = path.split("/")[1];
        let id = decodeURIComponent(path.split("/").slice(2).join("/")).replace(".m3u8", "").replace(".mpd", "");
        let url;
        
        switch (service) {
            case "tvrplus":
                const accessToken = await fetch("https://api.dejacast.com/api/v2/customer/auth", {
                    method: "POST",
                    headers: {
                        "content-type": "application/json",
                        "x-app-version": "1.0.12",
                        "x-device-language": "ro",
                        "x-device-os": "web",
                        "x-platform-slug": "tvrplus"
                    },
                    body: JSON.stringify({ email: Deno.env.get("TVRPLUS_EMAIL"), password: Deno.env.get("TVRPLUS_PASSWORD") })
                })
                    .then(response => response.json())
                    .then(json => json.access_token);

                url = await fetch(`https://api.dejacast.com/api/v2/videos/${id}/playback`, {
                    headers: {
                        "authorization": `Bearer ${accessToken}`,
                        "content-type": "application/json",
                        "x-app-version": "1.0.12",
                        "x-device-language": "ro",
                        "x-device-os": "web",
                        "x-platform-slug": "tvrplus",
                        "x-profile-id": "0"
                    }
                })
                    .then(response => response.json())
                    .then(json => json.data);
                break;

            default:
                return new Response("Invalid service", { status: 400, headers });
        };
        
        return new Response(null, { status: 307, headers: { ...headers, Location: url } });
    };
}, { port, hostname });