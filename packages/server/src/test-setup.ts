// packages/server/src/test-setup.ts
import { storage } from './storage/index.js';

async function setupTestProject() {
    await storage.createRoute({
        "method": "GET",
        "hostname": "api.api-ninjas.com",
        "path": "/v1/quotes",
        "responses": [
            {
                "headers": {
                    "content-type": "application/json",
                    "content-length": "117",
                    "connection": "close",
                    "date": "Sun, 05 Jan 2025 23:19:08 GMT",
                    "x-amzn-trace-id": "Root=1-677b136c-49e7c6950798dded34f26e9a;Parent=25dd471bc2f8a619;Sampled=0;Lineage=1:d891c757:0",
                    "x-amzn-requestid": "f180449b-05ee-4413-bcb0-c52c4350a91d",
                    "access-control-allow-origin": "*",
                    "allow": "GET, OPTIONS, POST",
                    "access-control-allow-headers": "*",
                    "x-amz-apigw-id": "D7_5AGmlvHcEdkA=",
                    "access-control-allow-methods": "GET, OPTIONS, POST",
                    "x-cache": "Miss from cloudfront",
                    "via": "1.1 36dcf1a6ec983195b309a349ed6dd758.cloudfront.net (CloudFront)",
                    "x-amz-cf-pop": "MAD56-P2",
                    "x-amz-cf-id": "jKcgatvlONVcU-Wg5sXXWIeUOEfWuDJGv8Tp3XXS7hhexxF2rN2mAw=="
                },
                "body": [
                    {
                        "quote": "I actually pray everyday, but I don't believe in God.",
                        "author": "Harvey Fierstein",
                        "category": "god"
                    }
                ],
                "status": 200,
                "count": 1,
                responseId: '',
                isLocked: false
            },
            {
                "headers": {
                    "content-type": "application/json",
                    "content-length": "355",
                    "connection": "close",
                    "date": "Sun, 05 Jan 2025 23:47:57 GMT",
                    "x-amzn-trace-id": "Root=1-677b1a2c-33f2017f24742f3054c9a255;Parent=3b7aca7cc455087c;Sampled=0;Lineage=1:d891c757:0",
                    "x-amzn-requestid": "50ede16b-5e3b-4563-ad04-d2f2ab0532e8",
                    "access-control-allow-origin": "*",
                    "allow": "GET, OPTIONS, POST",
                    "access-control-allow-headers": "*",
                    "x-amz-apigw-id": "D8EHFGVTvHcESRw=",
                    "access-control-allow-methods": "GET, OPTIONS, POST",
                    "x-cache": "Miss from cloudfront",
                    "via": "1.1 36dcf1a6ec983195b309a349ed6dd758.cloudfront.net (CloudFront)",
                    "x-amz-cf-pop": "MAD56-P2",
                    "x-amz-cf-id": "pm9FkGOykwcFZJ9yBCCQxpFG4o3slg9McRHTNPiDExVzdO20HLTXuA=="
                },
                "body": [
                    {
                        "quote": "In my books the technology that I choose to talk about has to serve the themes. What that means is that I end up having to cut out a lot of cool technology that would be really fun to describe and play with, but which would just confuse everybody. So in 'Amped,' I focus on neural implants.",
                        "author": "Daniel H. Wilson",
                        "category": "cool"
                    }
                ],
                "status": 200,
                "count": 1,
                responseId: '',
                isLocked: false
            },
            {
                "headers": {
                    "content-type": "application/json",
                    "content-length": "174",
                    "connection": "close",
                    "date": "Sun, 05 Jan 2025 23:48:10 GMT",
                    "x-amzn-trace-id": "Root=1-677b1a3a-7cecf4715b0949281cb322cd;Parent=09d38e99cfd2959e;Sampled=0;Lineage=1:d891c757:0",
                    "x-amzn-requestid": "f99be4d0-a01f-4c36-8deb-5505d6f12db1",
                    "access-control-allow-origin": "*",
                    "allow": "GET, OPTIONS, POST",
                    "access-control-allow-headers": "*",
                    "x-amz-apigw-id": "D8EJJH25vHcETNQ=",
                    "access-control-allow-methods": "GET, OPTIONS, POST",
                    "x-cache": "Miss from cloudfront",
                    "via": "1.1 40605ba3b22cd59a113b9b36c705b306.cloudfront.net (CloudFront)",
                    "x-amz-cf-pop": "MAD56-P2",
                    "x-amz-cf-id": "SERrOG85WHARt7lYKbSJMGdcPYTSvvhTbezJ0Rrcf0hd53uIVwEjeQ=="
                },
                "body": [
                    {
                        "quote": "The only vice that cannot be forgiven is hypocrisy. The repentance of a hypocrite is itself hypocrisy.",
                        "author": "Hazlitt, William",
                        "category": "forgiveness"
                    }
                ],
                "status": 200,
                "count": 1,
                responseId: '',
                isLocked: false
            },
            {
                "headers": {
                    "content-type": "application/json",
                    "content-length": "125",
                    "connection": "close",
                    "date": "Sun, 05 Jan 2025 23:48:32 GMT",
                    "x-amzn-trace-id": "Root=1-677b1a50-1fb0eecb04dddd91328aaca0;Parent=24baafe07bb0cb18;Sampled=0;Lineage=1:d891c757:0",
                    "x-amzn-requestid": "f3d9ef03-4e28-4c95-b13a-755e972c3533",
                    "access-control-allow-origin": "*",
                    "allow": "GET, OPTIONS, POST",
                    "access-control-allow-headers": "*",
                    "x-amz-apigw-id": "D8EMqG4GvHcEXHA=",
                    "access-control-allow-methods": "GET, OPTIONS, POST",
                    "x-cache": "Miss from cloudfront",
                    "via": "1.1 5a9407a8135fc4485c7bda1bbd27a126.cloudfront.net (CloudFront)",
                    "x-amz-cf-pop": "MAD56-P2",
                    "x-amz-cf-id": "s5c9CoK2I5YwK0fKMLYipjJQmLAHvbN4krjO9kpKty7PLAR9YKvYIA=="
                },
                "body": [
                    {
                        "quote": "I'd rather give my life than be afraid to give it. ",
                        "author": "Johnson, Lyndon Baines",
                        "category": "courage"
                    }
                ],
                "status": 200,
                "count": 1,
                responseId: '',
                isLocked: false
            },
            {
                "headers": {
                    "content-type": "application/json",
                    "content-length": "205",
                    "connection": "close",
                    "date": "Sun, 05 Jan 2025 23:49:28 GMT",
                    "x-amzn-trace-id": "Root=1-677b1a88-6746adee7e26d4a01fed8f4b;Parent=632447190acd7085;Sampled=0;Lineage=1:d891c757:0",
                    "x-amzn-requestid": "02dece7a-a26d-48c6-a222-495067e8646d",
                    "access-control-allow-origin": "*",
                    "allow": "GET, OPTIONS, POST",
                    "access-control-allow-headers": "*",
                    "x-amz-apigw-id": "D8EVUHZ5vHcEdqg=",
                    "access-control-allow-methods": "GET, OPTIONS, POST",
                    "x-cache": "Miss from cloudfront",
                    "via": "1.1 ea17beb3b7167ea4b16b5a6d11d59de4.cloudfront.net (CloudFront)",
                    "x-amz-cf-pop": "MAD56-P2",
                    "x-amz-cf-id": "xTH3zNICEinexThUqGq5gREYaVuHu80B--cQyVBaLB0EoC5SIayHUQ=="
                },
                "body": [
                    {
                        "quote": "In the 21st century our tastes buds, our brain chemistry, our biochemistry, our hormones and our kitchens have been hijacked by the food industry.",
                        "author": "Mark Hyman",
                        "category": "food"
                    }
                ],
                "status": 200,
                "count": 1,
                responseId: '',
                isLocked: false
            },
            {
                "headers": {
                    "content-type": "application/json",
                    "content-length": "135",
                    "connection": "close",
                    "date": "Mon, 06 Jan 2025 00:23:05 GMT",
                    "x-amzn-trace-id": "Root=1-677b2269-424b9a033e3e3c7f1d25fd48;Parent=68c41c635e126c7e;Sampled=0;Lineage=1:d891c757:0",
                    "x-amzn-requestid": "193768b7-08dd-4dab-a1d9-e7aeb1ff1cb2",
                    "access-control-allow-origin": "*",
                    "allow": "GET, OPTIONS, POST",
                    "access-control-allow-headers": "*",
                    "x-amz-apigw-id": "D8JQfHlJvHcEHfw=",
                    "access-control-allow-methods": "GET, OPTIONS, POST",
                    "x-cache": "Miss from cloudfront",
                    "via": "1.1 57afd7c325699412aa6569e0643f5f88.cloudfront.net (CloudFront)",
                    "x-amz-cf-pop": "MAD56-P2",
                    "x-amz-cf-id": "dn5c1-clPF35ozAluMcf2DlB6hUW18rRCxl8aXmDXchs9_lCUrnM6A=="
                },
                "body": [
                    {
                        "quote": "The Internet: transforming society and shaping the future through chat.",
                        "author": "Dave Barry",
                        "category": "computers"
                    }
                ],
                "status": 200,
                "count": 1,
                responseId: '',
                isLocked: false
            },
            {
                "headers": {
                    "content-type": "application/json",
                    "content-length": "212",
                    "connection": "close",
                    "date": "Mon, 06 Jan 2025 00:23:18 GMT",
                    "x-amzn-trace-id": "Root=1-677b2276-516372590979682e4cb725a9;Parent=6a651dcae74617dd;Sampled=0;Lineage=1:d891c757:0",
                    "x-amzn-requestid": "5b8ff2c4-ebd5-4980-8ad6-56fd59e5b1a7",
                    "access-control-allow-origin": "*",
                    "allow": "GET, OPTIONS, POST",
                    "access-control-allow-headers": "*",
                    "x-amz-apigw-id": "D8JSnEUbvHcEWlQ=",
                    "access-control-allow-methods": "GET, OPTIONS, POST",
                    "x-cache": "Miss from cloudfront",
                    "via": "1.1 2c2bff0ab7d4de9254d97607153f1bbe.cloudfront.net (CloudFront)",
                    "x-amz-cf-pop": "MAD56-P2",
                    "x-amz-cf-id": "8NSIZA3GtM5_ttqRoHSoCFA7bbNtbrhhUk_9HAuTObC4mPBHk6vTvQ=="
                },
                "body": [
                    {
                        "quote": "When the rose and the cross are united the alchemical marriage is complete and the drama ends. Then we wake from history and enter eternity.",
                        "author": "Robert Anton Wilson",
                        "category": "marriage"
                    }
                ],
                "status": 200,
                "count": 1,
                responseId: '',
                isLocked: false
            },
            {
                "headers": {
                    "content-type": "application/json",
                    "content-length": "392",
                    "connection": "close",
                    "date": "Mon, 06 Jan 2025 00:24:42 GMT",
                    "x-amzn-trace-id": "Root=1-677b22ca-54e932784d909f91787c646f;Parent=3e53f10f500570b0;Sampled=0;Lineage=1:d891c757:0",
                    "x-amzn-requestid": "69af7e38-742b-4b51-a25d-5bb10c069999",
                    "access-control-allow-origin": "*",
                    "allow": "GET, OPTIONS, POST",
                    "access-control-allow-headers": "*",
                    "x-amz-apigw-id": "D8JfrEf4PHcEGGQ=",
                    "access-control-allow-methods": "GET, OPTIONS, POST",
                    "x-cache": "Miss from cloudfront",
                    "via": "1.1 b33e450e1cd477843a111c167611fc90.cloudfront.net (CloudFront)",
                    "x-amz-cf-pop": "MAD56-P2",
                    "x-amz-cf-id": "qoO_2S5IgMHB9-U4Il81Ub3HMI29WRBLhA6iU-sWAHt9GGzkS1Rm7Q=="
                },
                "body": [
                    {
                        "quote": "Well, marriage doesn't function in the way it used to in terms of deciding our fate, but it's in our heads, and it determines a lot of our actions. Like, right now, if you think about gay marriage - and they just started having the first gay marriages in New York - it shows what a potent idea marriage remains for people.",
                        "author": "Jeffrey Eugenides",
                        "category": "marriage"
                    }
                ],
                "status": 200,
                "count": 1,
                responseId: '',
                isLocked: false
            },
            {
                "headers": {
                    "content-type": "application/json",
                    "content-length": "185",
                    "connection": "close",
                    "date": "Mon, 06 Jan 2025 00:24:45 GMT",
                    "x-amzn-trace-id": "Root=1-677b22cd-2a14c7e25ed55b89222875fb;Parent=2f3436c53ad12c97;Sampled=0;Lineage=1:d891c757:0",
                    "x-amzn-requestid": "187f8721-7cd9-4967-806d-8236d1e1cc01",
                    "access-control-allow-origin": "*",
                    "allow": "GET, OPTIONS, POST",
                    "access-control-allow-headers": "*",
                    "x-amz-apigw-id": "D8JgHGIMPHcEaZQ=",
                    "access-control-allow-methods": "GET, OPTIONS, POST",
                    "x-cache": "Miss from cloudfront",
                    "via": "1.1 a1c5b41398f2acc5c6d4914b2e941256.cloudfront.net (CloudFront)",
                    "x-amz-cf-pop": "MAD56-P2",
                    "x-amz-cf-id": "ptcIGWTyTEw_Dct3wfvuQibzg1R6OJgPrFABXK6D3OlddStWJQbKjg=="
                },
                "body": [
                    {
                        "quote": "To be free in an age like ours, one must be in a position of authority. That in itself would be enough to make me ambitious.",
                        "author": "Hannah Arendt",
                        "category": "age"
                    }
                ],
                "status": 200,
                "count": 1,
                responseId: '',
                isLocked: false
            }
        ],
        "isLocked": true,
        "hits": 0
    }
    );
    console.log('Test project created');
}

setupTestProject().catch(console.error);