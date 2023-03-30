import aws_cdk as core
import aws_cdk.assertions as assertions

from ara_py.ara_py_stack import AraPyStack

# example tests. To run these tests, uncomment this file along with the example
# resource in ara_py/ara_py_stack.py
def test_sqs_queue_created():
    app = core.App()
    stack = AraPyStack(app, "ara-py")
    template = assertions.Template.from_stack(stack)

#     template.has_resource_properties("AWS::SQS::Queue", {
#         "VisibilityTimeout": 300
#     })
