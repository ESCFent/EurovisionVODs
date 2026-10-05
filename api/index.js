import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
let headers = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET" };

const port = Number(Deno.env.get("PORT")) || 3000;
const hostname = Deno.env.get("IP") || "::";

serve(async request => {
    const path = new URL(request.url).pathname;

    if (path === "/") {
        return Response.redirect("https://github.com/ESCFent/EurovisionVODs/tree/master/api", 307);
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

            case "tg4":
                const videoInfo = await fetch(`https://edge.api.brightcove.com/playback/v1/accounts/1555966122001/videos/${id}`, {
                    headers: {
                        Accept: "application/json;pk=BCpk2eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIiwia2lkIjoicHJvZC1qd2UtMjAyNi0wNiIsInppcCI6IkRFRiJ9..t3nSzEKHbfI7o9ni.meZ6nFg77ObOHmaN7YZI1ydnmFhPP9wrSYhDs8WD8cm8_aEOjxfrJheebjAJUZwIAGgzxAfN25vcQNtlsNzsreCegyk26gbVmkBKkQ8KFdynwaa1hGctMmroeNAFAHihzkKw45CxRbWkdRPxT-DTZzQEpnqFnS5yrNfpg7ncolJzCgeGvPM7G6vzxtOWzDR5z87sbuFvWuEQzBasG7Amm7I7zb01KbMpQHautN6iPeL_suqkE-XbvOLNAilL7A88tXF6mQOFYIrvq8ygPpyDUPSrvVoKxWsHce69c36DypLlRAf2gRm-3g-6M7JbSKvydMGFZEKecpmNEMVDL7m5QvtX_YDFC2jGaYmpYmjjHHp9qOLuERVHqip_WDojTdkHlAXgK5uBKIL-Q6apZUahMmPe0XnF-a7_1CxPKfv1pgoG64f9eHpsslwwv1aVPqG5BxtGrk-BQuFuJKkstl9bNPZqKluMRZ_6pQ_YzKVlTLM_2921EIcfgs1Wgmzk6g9IhyGs0418J3JW44uo376MaQphgc9cxSjGNE2B0J1YFaymMqlOgQStquraembPJPvxPxMoRXjP9NcLlo8ohMiJc3yapWCD1PhYWtDK.9U6hUnWPulghFH4dLaK9dQ",
                        Origin: "https://www.tg4.ie"
                    }
                })
                    .then(response => response.json());

                url = videoInfo.sources.find(source => source.type === "application/dash+xml" && source.src.startsWith("https://")).src;
                break;

            default:
                return new Response("Invalid service", { status: 400, headers });
        };
        
        return new Response(null, { status: 307, headers: { ...headers, Location: url } });
    };
}, { port, hostname });