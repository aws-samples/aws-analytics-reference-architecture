// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { PolicyDocument } from '@aws-cdk/aws-iam';

export function iamPolicyActionEvaluator (policyDocument: PolicyDocument, allowedActions: string []) : Map<string, number> | undefined {

  const jsonPolicyDocument = policyDocument.toJSON();

  let actionsExists: boolean = true;

  let listPolicyActions: string [] = [];
  let statementPosition: Map<string, number> = new Map<string, number>();

  jsonPolicyDocument.Statement.forEach((statement: any, index: number) => {

    if (typeof statement.Action === 'object') {
      listPolicyActions.push(...statement.Action);
      statement.Action.forEach((action: any) => {
        statementPosition.set(action, index);
      });
    } else {
      listPolicyActions.push(statement.Action);
      statementPosition.set(statement.Action, index);
    }

  });

  allowedActions.forEach(action => {
    actionsExists = actionsExists && listPolicyActions.includes(action);
  });

  if (actionsExists) {return statementPosition;} else {return undefined;}
}
