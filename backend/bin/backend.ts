#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib/core';
import { BackendStack } from '../lib/backend-stack';

const app = new cdk.App();
new BackendStack(app, 'BackendStack', {
  // Always deploy to us-east-1, where the team's Cognito user pool lives,
  // no matter what region someone's AWS CLI is set to. The account still
  // comes from whoever is logged in (aws configure).
  env: { region: 'us-east-1' },

  /* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */
});
