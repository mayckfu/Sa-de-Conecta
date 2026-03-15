const key = "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDAhjSrAOCMSdlN\nDOqVdyjyfDxencoKFQprGftvO0XUA1UkWckmM62eNkA2JgkIcSJZktmi17Nk3e5c\nwPqozxVwpb3sMgGpkGXY0r8mJBX0Nl69qF9POvlsb9m9sOSL50asO+LC/iAQw7ta\n0oY1B/YwbGjaz8eYq0Yy15rJq9Bx5AfEcr6WOc3hFU2iRwarHQCbhBofLbHx6C58\n8aOdj0NP5QeykEdchYxCSc+GU312uj6367D1GGiSQHJG3ZAPeuoDy8pEaqK1L0eW\ny5WdMtXIF78xl+3TQ+g/IO6f4uwafRiZveBxLUMx7g2wRPoC0rP6xHcf/R5qdU+M\nqhWa0KhpAgMBAAECggEAB6CpkIbZ3qUEX3meB6rva+ABMkx1Fz4rKgAfBpKmGxbA\ntk56WjGc9NI4bAzIudVlo3/ecIW0PVBPo8wfgjWmJ07hvexjRXkLl/INkbDHT+Qh\nj8kOcaCoBiROT6Yk/+f7VFKREuGnmpJup1QE7i/xEI0TAGxP/5v1jYkeQFQ2z3RE\nQkBoYfj5MvZX6Wl2OBVz1K2ZIXhhd64nYpwP9GkqX5Ed7aD27GUMQ+6xi9EefzKM\nlHioPq9nOPa/JG9eid2pDllyIsRiRWp10UFiRSfNezBJCmAdttiBvBYfGRUkdfnG\nqcxBNNz3foazRDdUP0jNY4gtRFcnVGYLx8ep1FrEAQKBgQDmDkUBWuz4hPiJ1j2j\nGtVbTpgf/GZZgSIKPnqgTGotxxMMx60K38r22MQEGcd3/ociDUIh4L66OzIMGVB3\nv3tCRTn/HvpvA2cg++eFOrNha2qL2Ln2opsT31upV4cqD4aIWorbEnjUuawUReqZ\nfJAsveF91Z3FYgeBT4edqs1tAQKBgQDWPGX5Vi5mcpZxTDjAI5yxEdJP5/dRVfHD\WWLktMMziJMgdS0542rnWJGHinQ6reEzvFYtF6N86Hxe3TIYVq72qwwzJGavDj2N\ntqAUq3NQYD+9BKbw7uAVb+epby5NPwv+d8ztGqheJzGtaFKK32AgxVEvZPuTgfwzS\nDUXNwxfzaQKBgHTpQYYryAuPv6KEnrQ52b1aFpMCuJy5tCvSjozR6I+1AGhZPQYu\nrr19cTfIRgcj8VaLuFTxGtwXYxqk7rC8PY5zEcMl4gzyhMFNYt3g8/IJHY9OJ0tA\nXWDe/Hz1fzoPw8Wdhb1JCODKLrnqwgsYM0iZgnNpUJFTfQ7o9LlaaKUBAoGAb8tO\nz2EIj49mMDM9Pg6XWtNY8zeyGHCH24/OilhFsKOpWvuqoRWqmJTgRGGcq25HIW87\nbQZz2t+a3woAdTDu1muFzz5Ekz8UIdpWCNM7NoszV5iQ4RNWPfmKYyFQgSDQSncL\nqgMKLy+2va29vRZ68/rwJaqrVvcVopsofOo8mlkCgYBpEobo6YHfeA3V55b+dlYT\nweyAKz6u9MfZvlapSDm7NzkAkDfX/+DA2IWWo9RxEItgYNKVstRZW9QznFiIjFlV\nAypwpHtHKumcTk/hSCoBou5pDsqO5PSPiFe7hfuUCCxHSNO8xZ0DvN8kmhuozVvg\nQag+XPT9LvIsB6jV2z8Qbg==\n-----END PRIVATE KEY-----\n";

const cleaned = key.replace(/-----(BEGIN|END) [A-Z ]+-----/g, '').replace(/[^A-Za-z0-9+/=]/g, '');
console.log('Cleaned length:', cleaned.length);
console.log('Mod 4:', cleaned.length % 4);

// Check if removing some characters makes it mod 4
for (let i = -5; i <= 5; i++) {
  if ((cleaned.length + i) % 4 === 0) {
    console.log(`If length was ${cleaned.length + i}, diff ${i}`);
  }
}
