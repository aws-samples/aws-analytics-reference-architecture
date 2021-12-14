FROM public.ecr.aws/lambda/python:3.8

# Copy function code
COPY batch-replay-fn.py ${LAMBDA_TASK_ROOT}

# Install the function's dependencies
# COPY requirements.txt  . #TODO remove this if not used
RUN  pip3 install "pandas==1.3.5" "s3fs<=0.4" --target "${LAMBDA_TASK_ROOT}"

# Set the CMD to your handler (could also be done as a parameter override outside of the Dockerfile)
CMD [ "batch-replay-fn.handler" ]