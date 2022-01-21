FROM public.ecr.aws/lambda/python:3.8

# Install the function's dependencies
RUN  pip3 install "pandas==1.3.5" "s3fs<=0.4" --target "${LAMBDA_TASK_ROOT}"

# Copy Python function code
COPY *.py ${LAMBDA_TASK_ROOT}

# Set the CMD to your handler (could also be done as a parameter override outside of the Dockerfile)
CMD [ "write-in-batch.handler" ]