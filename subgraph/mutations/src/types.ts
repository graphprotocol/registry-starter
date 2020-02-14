export interface ImageUploadArguments {
  image: File
}

export interface AddTokenArguments {
  symbol: string
  description: string
  image?: File
  decimals?: number
  address?: string
}

export interface EditTokenArguments {
  symbol: string
  description: string
  image?: File
  decimals?: number
  address?: string
}

export interface RemoveTokenArguments {
  tokenId: string
}

export interface ChallengeTokenArguments {
  challengingTokenAddress: string
  challengedTokenAddress: string
  description?: string
}

export interface VoteChallengeArguments {
  challengeId: string
  voteChoices: number[]
  voters: string[]
}
