import { AwsVpcIcon } from './AwsVpcIcon'
import { AwsEc2Icon } from './AwsEc2Icon'
import { AwsRdsIcon } from './AwsRdsIcon'
import { AwsS3Icon } from './AwsS3Icon'
import { AwsLambdaIcon } from './AwsLambdaIcon'
import { AwsElbIcon } from './AwsElbIcon'
import { AwsIgwIcon } from './AwsIgwIcon'
import { AwsNatIcon } from './AwsNatIcon'
import { AwsRoute53Icon } from './AwsRoute53Icon'
import { AwsCloudfrontIcon } from './AwsCloudfrontIcon'
import { AwsEcsIcon } from './AwsEcsIcon'
import { AwsEksIcon } from './AwsEksIcon'
import { AwsDynamoIcon } from './AwsDynamoIcon'
import { AwsElastiCacheIcon } from './AwsElastiCacheIcon'
import { AwsWafIcon } from './AwsWafIcon'
import { AwsSgIcon } from './AwsSgIcon'
import { AwsTransitGwIcon } from './AwsTransitGwIcon'
import { AwsVpnGwIcon } from './AwsVpnGwIcon'

export const AWS_ICON_MAP: Record<string, React.ComponentType<{ className?: string; color?: string }>> = {
  'aws-vpc': AwsVpcIcon,
  'aws-ec2': AwsEc2Icon,
  'aws-rds': AwsRdsIcon,
  'aws-s3': AwsS3Icon,
  'aws-lambda': AwsLambdaIcon,
  'aws-elb': AwsElbIcon,
  'aws-igw': AwsIgwIcon,
  'aws-nat': AwsNatIcon,
  'aws-route53': AwsRoute53Icon,
  'aws-cloudfront': AwsCloudfrontIcon,
  'aws-ecs': AwsEcsIcon,
  'aws-eks': AwsEksIcon,
  'aws-dynamodb': AwsDynamoIcon,
  'aws-elasticache': AwsElastiCacheIcon,
  'aws-waf': AwsWafIcon,
  'aws-sg': AwsSgIcon,
  'aws-tgw': AwsTransitGwIcon,
  'aws-vpngw': AwsVpnGwIcon,
}
