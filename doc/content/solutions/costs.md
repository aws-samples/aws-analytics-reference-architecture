You can use Cost Explorer to see the cost of the AWS Analytics Reference Architecture globally or module by module.

To help with that, we added two tags `project-name` and `module-name`, but you need to activate these tags to be able to use them.


> Note:  the tags are applied to the cost data after they are enabled and this is not retroactive.

To activate the tags, go to the Billing & Cost Management Dashboard:

![Billing & Cost Management Dashboard](../resources/cost-1.png)

Then, name sure `module-name` and `project-name` tags are both in the `Active` status.

![Cost allocation tags](../resources/cost-2.png)

All cost data generated after activation will be tagged by these two when they exist.