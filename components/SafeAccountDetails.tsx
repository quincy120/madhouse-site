import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import PhotoIcon from '@mui/icons-material/Photo'
import {
  Button,
  CircularProgress,
  Link,
  Paper,
  Stack,
  Tooltip,
  Typography
} from '@mui/material'
import { PasskeyArgType } from '@safe-global/protocol-kit'
import { Safe4337Pack } from '@safe-global/relay-kit'
import Image from 'next/image'
import { useCallback, useEffect, useState } from 'react'
import { BUNDLER_URL, CHAIN_NAME, RPC_URL } from '../lib/constants'
import SafeLogo from '../public/safeLogo.png'

import { extractPasskeyData } from '@safe-global/protocol-kit'
import "dotenv/config"
import { Hex, createPublicClient, getContract, http, encodePacked } from "viem"
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts"
import { sepolia } from "viem/chains"
import {  createPimlicoClient } from "permissionless/clients/pimlico"
import {  createBundlerClient, entryPoint07Address, createPaymasterClient } from "viem/account-abstraction"
import { createSmartAccountClient } from "permissionless"
import { erc7579Actions } from 'permissionless/actions/erc7579'
import {
  getSocialRecoveryValidator,
  RHINESTONE_ATTESTER_ADDRESS,
  MOCK_ATTESTER_ADDRESS,
} from '@rhinestone/module-sdk'
import { toSafeSmartAccount } from "permissionless/accounts"

type props = {
  passkey: PasskeyArgType
}

function SafeAccountDetails({ passkey }: props) {
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [safeAddress, setSafeAddress] = useState<string>()
  const [isSafeDeployed, setIsSafeDeployed] = useState<boolean>()
  const [userOp, setUserOp] = useState<string>()

  const RP_NAME = 'Safe Smart Account'
const USER_DISPLAY_NAME = 'User display name'
const USER_NAME = 'User name'

const apiKey = 'pim_R8HnYSXY7JhDE1sb7CxWW2'
if (!apiKey) throw new Error("Missing PIMLICO_API_KEY")

 const publicClient = createPublicClient({
    chain: sepolia,
    transport: http("https://rpc.ankr.com/eth_sepolia"),
  })
  const owner = privateKeyToAccount(generatePrivateKey())

  const pimlicoUrl = `https://api.pimlico.io/v2/sepolia/rpc?apikey=${apiKey}`
  
  const pimlicoClient = createPimlicoClient({
    transport: http(pimlicoUrl),
    entryPoint: {
      address: entryPoint07Address,
      version: "0.7",
    }
  })

  const showSafeInfo = useCallback(async () => {
    setIsLoading(true)

    const safe4337Pack = toSafeSmartAccount({
      client: publicClient,
      owners: [owner],
      version: '1.4.1',
      entryPoint: {
        address: entryPoint07Address,
        version: '0.7',
      },
      safe4337ModuleAddress: '0x7579EE8307284F293B1927136486880611F20002', 
      erc7579LaunchpadAddress: '0x7579011aB74c46090561ea277Ba79D510c6C00ff',
      attesters: [
        RHINESTONE_ATTESTER_ADDRESS, // Rhinestone Attester
        MOCK_ATTESTER_ADDRESS, // Mock Attester - do not use in production
      ],
      attestersThreshold: 1,
      })
        



    const safeAddress = '0x7579EE8307284F293B1927136486880611F20002'
    const isSafeDeployed = true

    setSafeAddress(safeAddress)
    setIsSafeDeployed(isSafeDeployed)
    setIsLoading(false)
  }, [passkey])

  useEffect(() => {
    showSafeInfo()
  }, [showSafeInfo])


  const safeLink = `https://app.safe.global/home?safe=sep:${safeAddress}`
  const jiffscanLink = `https://jiffyscan.xyz/userOpHash/${userOp}?network=${CHAIN_NAME}`

  return (
    <Paper sx={{ margin: '32px auto 0', minWidth: '320px' }}>
      <Stack padding={4} alignItems={'center'}>
        <Typography textAlign={'center'} variant="h1" color={'primary'}>
          Your Safe Account
        </Typography>

        {isLoading || !safeAddress ? (
          <CircularProgress sx={{ margin: '24px 0' }} />
        ) : (
          <>
            <Typography textAlign={'center'}>
              <Link
                href={safeLink}
                target="_blank"
                underline="hover"
                color="text"
              >
                <Tooltip title={safeAddress}>
                  <Stack
                    component={'span'}
                    padding={4}
                    direction={'row'}
                    alignItems={'center'}
                  >
                    <Image
                      width={32}
                      src={SafeLogo}
                      alt={'safe account logo'}
                    />
                    <span style={{ margin: '0 8px' }}>
                      {splitAddress(safeAddress)}
                    </span>
                    <OpenInNewIcon />
                  </Stack>
                </Tooltip>
              </Link>
            </Typography>

            {!isSafeDeployed && <PendingDeploymentLabel />}

            {userOp && (
              <Typography textAlign={'center'}>
                <Link
                  href={jiffscanLink}
                  target="_blank"
                  underline="hover"
                  color="text"
                >
                  <Stack
                    component={'span'}
                    padding={4}
                    direction={'row'}
                    alignItems={'center'}
                  >
                    {userOp}
                    <OpenInNewIcon />
                  </Stack>
                </Link>
              </Typography>
            )}
          </>
        )}
      </Stack>
    </Paper>
  )
}

export default SafeAccountDetails

const DEFAULT_CHAR_DISPLAYED = 6

function splitAddress(
  address: string,
  charDisplayed: number = DEFAULT_CHAR_DISPLAYED
): string {
  const firstPart = address.slice(0, charDisplayed)
  const lastPart = address.slice(address.length - charDisplayed)

  return `${firstPart}...${lastPart}`
}

function PendingDeploymentLabel() {
  return (
    <div style={{ margin: '12px auto' }}>
      <span
        style={{
          marginRight: '8px',
          borderRadius: '4px',
          padding: '4px 12px',
          border: '1px solid rgb(255, 255, 255)',
          whiteSpace: 'nowrap',
          backgroundColor: 'rgb(240, 185, 11)',
          color: 'rgb(0, 20, 40)'
        }}
      >
        Deployment pending
      </span>
    </div>
  )
}
