import { PreBundledPysparkJobExecutable } from 'aws-analytics-reference-architecture';
import { Job } from '@aws-cdk/aws-glue-alpha';
 
 new glue.Job(this, 'PythonShellJob', {
   executable: PreBundledPysparkJobExecutable.pythonEtl({
     glueVersion: glue.GlueVersion.V3_0,
     pythonVersion: glue.PythonVersion.THREE,
     codePath: 'construct-dir/resources/glue/script.py',
  }),
   description: 'an example PySpark job with bundled script',
 });