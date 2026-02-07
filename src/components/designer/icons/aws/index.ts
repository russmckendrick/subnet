import { AwsCloudfrontIcon } from './AwsCloudfrontIcon'
import { AwsDynamoIcon } from './AwsDynamoIcon'
import { AwsEc2Icon } from './AwsEc2Icon'
import { AwsEcsIcon } from './AwsEcsIcon'
import { AwsEksIcon } from './AwsEksIcon'
import { AwsElastiCacheIcon } from './AwsElastiCacheIcon'
import { AwsElbIcon } from './AwsElbIcon'
import { AwsIgwIcon } from './AwsIgwIcon'
import { AwsLambdaIcon } from './AwsLambdaIcon'
import { AwsNatIcon } from './AwsNatIcon'
import { AwsRdsIcon } from './AwsRdsIcon'
import { AwsRoute53Icon } from './AwsRoute53Icon'
import { AwsS3Icon } from './AwsS3Icon'
import { AwsSgIcon } from './AwsSgIcon'
import { AwsTransitGwIcon } from './AwsTransitGwIcon'
import { AwsVpcIcon } from './AwsVpcIcon'
import { AwsVpnGwIcon } from './AwsVpnGwIcon'
import { AwsWafIcon } from './AwsWafIcon'

export const AWS_ICON_MAP: Record<string, React.ComponentType<{ className?: string; color?: string }>> = {
  'aws-cloudfront': AwsCloudfrontIcon,
  'aws-dynamo': AwsDynamoIcon,
  'aws-ec2': AwsEc2Icon,
  'aws-ecs': AwsEcsIcon,
  'aws-eks': AwsEksIcon,
  'aws-elasticache': AwsElastiCacheIcon,
  'aws-elb': AwsElbIcon,
  'aws-igw': AwsIgwIcon,
  'aws-lambda': AwsLambdaIcon,
  'aws-nat': AwsNatIcon,
  'aws-rds': AwsRdsIcon,
  'aws-route53': AwsRoute53Icon,
  'aws-s3': AwsS3Icon,
  'aws-sg': AwsSgIcon,
  'aws-transitgw': AwsTransitGwIcon,
  'aws-vpc': AwsVpcIcon,
  'aws-vpngw': AwsVpnGwIcon,
  'aws-waf': AwsWafIcon,
}
