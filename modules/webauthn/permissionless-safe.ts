// Reference: https://github.com/rhinestonewtf/module-sdk-tutorials/blob/main/src/webauthn/permissionless-safe.ts

import {
  getWebAuthnValidator,
  getWebauthnValidatorSignature,
  getTrustAttestersAction,
  RHINESTONE_ATTESTER_ADDRESS,
  MOCK_ATTESTER_ADDRESS,
} from "@rhinestone/module-sdk";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { createPublicClient, http, pad } from "viem";
import { createSmartAccountClient } from "permissionless";
import { erc7579Actions } from "permissionless/actions/erc7579";
import { createPimlicoClient } from "permissionless/clients/pimlico";
import {
  createPaymasterClient,
  entryPoint07Address,
  getUserOperationHash,
} from "viem/account-abstraction";
import { toSafeSmartAccount } from "permissionless/accounts";
import { getAccountNonce } from "permissionless/actions";
import {
  b64ToBytes,
  base64FromUint8Array,
  findQuoteIndices,
  hexStringToUint8Array,
  parseAndNormalizeSig,
  uint8ArrayToHexString,
} from "./utils";
import {
  create,
  get,
  PublicKeyCredentialWithAttestationJSON,
} from "@github/webauthn-json";
import crypto from "crypto";
import { PasskeyArgType, extractPasskeyData } from '@safe-global/protocol-kit'
import { saveRegistration } from "./demo/state";


function clean(str: string) {
  return str.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

export default async function main({
  bundlerUrl,
  rpcUrl,
  paymasterUrl,
  chain,
}: {
  bundlerUrl: string;
  rpcUrl: string;
  paymasterUrl: string;
  chain: any;
}) {

////////////////////////////////////////////
/////// Create Wallet/////////////////////////
/////////////////////////////////////////////


  const publicClient = createPublicClient({
    transport: http(rpcUrl),
    chain: chain,
  });

  const pimlicoClient = createPimlicoClient({
    transport: http(bundlerUrl),
    entryPoint: {
      address: entryPoint07Address,
      version: "0.7",
    },
  });

  const paymasterClient = createPaymasterClient({
    transport: http(paymasterUrl),
  });
  
  //if already has public key do getRegistration("emailaddress")
  const owner = privateKeyToAccount(generatePrivateKey());

  const safeAccount = await toSafeSmartAccount({
    client: publicClient,
    owners: [owner],
    version: "1.4.1",
    entryPoint: {
      address: entryPoint07Address,
      version: "0.7",
    },
    safe4337ModuleAddress: "0x7579EE8307284F293B1927136486880611F20002",
    erc7579LaunchpadAddress: "0x7579011aB74c46090561ea277Ba79D510c6C00ff",
    attesters: [
      RHINESTONE_ATTESTER_ADDRESS, // Rhinestone Attester
      MOCK_ATTESTER_ADDRESS, // Mock Attester - do not use in production
    ],
    attestersThreshold: 1,
  });

  const smartAccountClient = createSmartAccountClient({
    account: safeAccount,
    chain: chain,
    bundlerTransport: http(bundlerUrl),
    paymaster: paymasterClient,
    userOperation: {
      estimateFeesPerGas: async () => {
        return (await pimlicoClient.getUserOperationGasPrice()).fast;
      },
    },
  }).extend(erc7579Actions());

////////////////////////////////////////////////////////////////////////////////
///////////////////////Create new Passkey /////////////////////////////////////
/////////////////////////////////////////////////////////////////


  const saltUUID = crypto.createHash("sha256").update("salt").digest("hex");

  const _credential = await create({
    publicKey: {
      challenge: clean(crypto.randomBytes(32).toString("base64")),
      rp: {
        // Change these later
        name: "Rhinestone",
        id: "test",
      },
      user: {
        id: saltUUID,
        name: "rhinestone wallet",
        displayName: "rhinestone wallet",
      },
      // Don't change these later
      pubKeyCredParams: [{ alg: -7, type: "public-key" }],
      timeout: 60000,
      attestation: "direct",
      authenticatorSelection: {
        residentKey: "required",
        userVerification: "required",
        authenticatorAttachment: "platform",
      },
    },
  });


  //////////////////////////////////////////
  /////Save to local storage and to database for persistant storage//////////////////
  /////////////////////////////////////////////////////////////////////
  //https://github.com/safe-global/safe-core-sdk/blob/main/packages/protocol-kit/src/utils/passkeys/extractPasskeyData.ts

  saveRegistration(_credential)
  const passkey = await extractPasskeyData(_credential)

////////////////////////// Get Validator /////////////////
// We can also retrieve this data from db if we have a returning user by their email address
// i filled in the below with what i would think this should be filled in with but it needs to be tested
  const webauthn = getWebAuthnValidator({
    pubKeyX: passkey.coordinates.x,
    pubKeyY: passkey.coordinates.y,
    authenticatorId: _credential.id,
  });

/////////////////////////////////////////////////
/////////Install Module and with passkey/////////////////////////////
/////////////////////////////////////////////////////////////////

  const opHash = await smartAccountClient.installModule({
    type: webauthn.type,
    address: webauthn.module,
    context: webauthn.initData!,
  });

  await pimlicoClient.waitForUserOperationReceipt({
    hash: opHash,
  });

  const nonce = await getAccountNonce(publicClient, {
    address: safeAccount.address,
    entryPointAddress: entryPoint07Address,
    key: BigInt(pad(webauthn.module, { dir: "right", size: 24 })),
  });

  const action = getTrustAttestersAction({
    threshold: 1,
    attesters: [RHINESTONE_ATTESTER_ADDRESS],
  });

  const calls = [
    {
      to: action.target,
      data: action.callData,
    },
  ];


  //Batch Multiple Transactions: https://docs.pimlico.io/permissionless/how-to/parallel-transactions
  //
  const userOperation = await smartAccountClient.prepareUserOperation({
    account: safeAccount,
    calls: calls,
    nonce,
    // signature: getWebauthnValidatorMockSignature(),
    signature:
      "0x00000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000001200000000000000000000000000000000000000000000000000000000000000001635bc6d0f68ff895cae8a288ecf7542a6a9cd555df784b73e1e2ea7e9104b1db15e9015d280cb19527881c625fee43fd3a405d5b0d199a8c8e6589a7381209e40000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002549960de5880e8c687434170f6476605b8fe4aeb9a28632c7995cf3ba831d97631d0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000f47b2274797065223a22776562617574686e2e676574222c226368616c6c656e6765223a22746278584e465339585f3442797231634d77714b724947422d5f3330613051685a36793775634d30424f45222c226f726967696e223a22687474703a2f2f6c6f63616c686f73743a33303030222c2263726f73734f726967696e223a66616c73652c20226f746865725f6b6579735f63616e5f62655f61646465645f68657265223a22646f206e6f7420636f6d7061726520636c69656e74446174614a534f4e20616761696e737420612074656d706c6174652e205365652068747470733a2f2f676f6f2e676c2f796162506578227d000000000000000000000000",
  });

  const userOpHashToSign = getUserOperationHash({
    chainId: chain.id,
    entryPointAddress: entryPoint07Address,
    entryPointVersion: "0.7",
    userOperation,
  });

  // const formattedMessage = userOpHashToSign.startsWith("0x")
  //   ? userOpHashToSign.slice(2)
  //   : userOpHashToSign;

  // const challenge = base64FromUint8Array(
  //   hexStringToUint8Array(formattedMessage),
  //   true
  // );

  // // prepare assertion options
  // const assertionOptions: PublicKeyCredentialWithAttestationJSON = {
  //   challenge,
  //   // allowCredentials,
  //   userVerification: "required",
  // };

  const cred = await get({
    publicKey: {
      challenge: Buffer.from(userOpHashToSign, "hex").toString("base64"),
      timeout: 60000,
      userVerification: "required",
      rpId: "test",
      allowCredentials: [
        {
          id: _credential.id, // rawId
          type: "public-key",
        },
      ],
    },
  });
  // return parseSignatureResponse({
  //   signatureB64: sigCredential.response.signature,
  //   rawAuthenticatorDataB64: sigCredential.response.authenticatorData,
  //   rawClientDataJSONB64: sigCredential.response.clientDataJSON,
  //   passkeyName: keyName,
  // });

  // get authenticator data
  const { authenticatorData } = cred.response;
  const authenticatorDataHex = uint8ArrayToHexString(
    b64ToBytes(authenticatorData),
  );

  // get client data JSON
  const clientDataJSON = atob(cred.response.clientDataJSON);

  // get challenge and response type location
  const { beforeType } = findQuoteIndices(clientDataJSON);

  // get signature r,s
  const { signature } = cred.response;
  const signatureHex = uint8ArrayToHexString(b64ToBytes(signature));
  const { r, s } = parseAndNormalizeSig(signatureHex);

  const userOpHash = await smartAccountClient.sendUserOperation({
    account: safeAccount,
    calls: calls,
    nonce,
    signature: getWebauthnValidatorSignature({
      authenticatorData: authenticatorDataHex,
      clientDataJSON,
      responseTypeLocation: BigInt(beforeType),
      r: BigInt(r),
      s: BigInt(s),
      usePrecompiled: false,
    }),
  });

  const receipt = await pimlicoClient.waitForUserOperationReceipt({
    hash: userOpHash,
  });

  return receipt;
}
