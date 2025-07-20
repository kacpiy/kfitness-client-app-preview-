interface ReferralReward {
  id: number;
}

interface ReferralUsers {
  id: number;
}

enum ReferralRewardStatus {
  NEW = '10',
  COLLECTED = '30',
  EXPIRED = '90'
}