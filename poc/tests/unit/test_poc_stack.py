import aws_cdk as core
import aws_cdk.assertions as assertions

from poc.poc_stack import PocStack

# example tests. To run these tests, uncomment this file along with the example
# resource in poc/poc_stack.py
def test_sqs_queue_created():
    app = core.App()
    stack = PocStack(app, "poc")
    template = assertions.Template.from_stack(stack)

#     template.has_resource_properties("AWS::SQS::Queue", {
#         "VisibilityTimeout": 300
#     })
