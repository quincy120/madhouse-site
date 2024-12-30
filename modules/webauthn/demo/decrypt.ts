const publicKey =[
  {
    "type": "public-key",
    "id": "M16qxRolpk_M0CTaDGmm8BqCT3P2zGL1VhYqZdI15WU",
    "rawId": "M16qxRolpk_M0CTaDGmm8BqCT3P2zGL1VhYqZdI15WU",
    "authenticatorAttachment": "platform",
    "response": {
      "clientDataJSON": "eyJ0eXBlIjoid2ViYXV0aG4uY3JlYXRlIiwiY2hhbGxlbmdlIjoiQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQSIsIm9yaWdpbiI6Imh0dHBzOi8vZ2l0aHViLmdpdGh1Yi5jb20iLCJjcm9zc09yaWdpbiI6ZmFsc2V9",
      "attestationObject": "o2NmbXRkbm9uZWdhdHRTdG10oGhhdXRoRGF0YVikdw7pscJNS5PNdL61_xOSVTfQlXz4AGEcGDQ6nrlafidFAAAAAAAAAAAAAAAAAAAAAAAAAAAAIDNeqsUaJaZPzNAk2gxppvAagk9z9sxi9VYWKmXSNeVlpQECAyYgASFYIN0Pv412kV5gxJdPUfDacyspxgc-QRqxpPEc5X7yVreZIlgg33CtVIK-pBaKIpJ88qD9bO3p-jLk8WKCVSVmsqxW9r8",
      "transports": [
        "internal"
      ]
    },
    "clientExtensionResults": {
      "credProps": {
        "rk": true
      }
    }
  }
]

export async function decodePublicKeyForWeb(publicKey: ArrayBuffer): Promise<PasskeyCoordinates> {
    const algorithm = {
      name: 'ECDSA',
      namedCurve: 'P-256',
      hash: { name: 'SHA-256' }
    }
  
    const key = await crypto.subtle.importKey('spki', publicKey, algorithm, true, ['verify'])
  
    const { x, y } = await crypto.subtle.exportKey('jwk', key)
  
    const isValidCoordinates = !!x && !!y
  
    if (!isValidCoordinates) {
      throw new Error('Failed to generate passkey Coordinates. crypto.subtle.exportKey() failed')
    }
  
    return {
      x: '0x' + Buffer.from(x, 'base64').toString('hex'),
      y: '0x' + Buffer.from(y, 'base64').toString('hex')
    }
  }

  export type PasskeyCoordinates = {
    x: string
    y: string
  }

  decodePublicKeyForWeb(publicKey);