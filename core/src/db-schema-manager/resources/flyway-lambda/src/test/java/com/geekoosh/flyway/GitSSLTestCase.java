package com.geekoosh.flyway;
import org.eclipse.jetty.servlet.ServletContextHandler;
import org.eclipse.jetty.servlet.ServletHolder;
import org.eclipse.jgit.api.AddCommand;
import org.eclipse.jgit.api.Git;
import org.eclipse.jgit.http.server.GitServlet;
import org.eclipse.jgit.junit.TestRepository;
import org.eclipse.jgit.junit.http.AppServer;
import org.eclipse.jgit.junit.http.HttpTestCase;
import org.eclipse.jgit.lib.ConfigConstants;
import org.eclipse.jgit.lib.ObjectId;
import org.eclipse.jgit.lib.Repository;
import org.eclipse.jgit.revwalk.RevCommit;
import org.eclipse.jgit.transport.*;
import org.junit.rules.TemporaryFolder;

import javax.net.ssl.*;
import java.io.File;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.security.KeyManagementException;
import java.security.NoSuchAlgorithmException;
import java.security.cert.X509Certificate;
import java.util.List;


public class GitSSLTestCase extends HttpTestCase {

    private TestRepository<Repository> src;

    public TemporaryFolder folder;

    private URIish remoteURI;

    private URIish secureURI;

    private Git clientRepo;

    private CredentialsProvider credentialsProvider = new UsernamePasswordCredentialsProvider(AppServer.username, AppServer.password);

    public String getRepoUrl() {
        return secureURI.toString();
    }

    public class GitFile {
        private File file;
        private String content;
        private String destPath;

        public GitFile(URL resource, String destPath) {
            this.file = new File(resource.getFile());
            this.destPath = destPath;
        }
        public GitFile(String content, String destPath) {
            this.content = content;
            this.destPath = destPath;
        }

        public File getFile() {
            return file;
        }

        public String getDestPath() {
            return destPath;
        }

        public String getContent() {
            return content;
        }
    }

    private static void disableSslVerification() {
        try
        {
            // Create a trust manager that does not validate certificate chains
            TrustManager[] trustAllCerts = new TrustManager[] {new X509TrustManager() {
                public java.security.cert.X509Certificate[] getAcceptedIssuers() {
                    return null;
                }
                public void checkClientTrusted(X509Certificate[] certs, String authType) {
                }
                public void checkServerTrusted(X509Certificate[] certs, String authType) {
                }
            }
            };

            // Install the all-trusting trust manager
            SSLContext sc = SSLContext.getInstance("SSL");
            sc.init(null, trustAllCerts, new java.security.SecureRandom());
            HttpsURLConnection.setDefaultSSLSocketFactory(sc.getSocketFactory());

            // Create all-trusting host name verifier
            HostnameVerifier allHostsValid = (hostname, session) -> true;

            // Install the all-trusting host verifier
            HttpsURLConnection.setDefaultHostnameVerifier(allHostsValid);
        } catch (NoSuchAlgorithmException | KeyManagementException e) {
            e.printStackTrace();
        }
    }

    @Override
    public void setUp() throws Exception {
        super.setUp();
        disableSslVerification();

        folder = new TemporaryFolder();
        folder.create();

        src = createTestRepository();
        src.getRepository()
                .getConfig()
                .setBoolean(ConfigConstants.CONFIG_CORE_SECTION, null,
                        ConfigConstants.CONFIG_KEY_LOGALLREFUPDATES, true);
        final String srcName = src.getRepository().getDirectory().getName();

        GitServlet gs = new GitServlet();

        gs.setRepositoryResolver(new TestRepositoryResolver(src, srcName));
        ServletContextHandler app = server.addContext("/git");
        app.addServlet(new ServletHolder(gs), "/*");
        server.authBasic(app);
        server.setUp();

        remoteURI = toURIish(app, srcName);
        secureURI = new URIish(rewriteUrl(remoteURI.toString(), "https",
                server.getSecurePort()));

        clientRepo = Git.cloneRepository()
                .setCredentialsProvider(credentialsProvider)
                .setDirectory(folder.getRoot())
                .setURI(getRepoUrl())
                .setBranch(master)
                .setRemote("origin")
                .call();
    }

    @Override
    public void tearDown() throws Exception {
        folder.delete();
        super.tearDown();
    }


    @Override
    protected AppServer createServer() {
        return new AppServer(0, 0);
    }

    public ObjectId pushFilesToMaster(List<GitFile> files) throws Exception {
        AddCommand addCommand = clientRepo.add();
        for(GitFile f : files) {
            Path destPath = Paths.get(folder.getRoot().getPath(), f.getDestPath());
            if(f.getFile() != null) {
                new File(destPath.toString()).mkdirs();
                Files.copy(Paths.get(f.getFile().getPath()), destPath, StandardCopyOption.REPLACE_EXISTING);
            } else {
                new File(destPath.getParent().toString()).mkdirs();
                Files.write(destPath, f.getContent().getBytes());
            }
            addCommand.addFilepattern(f.getDestPath());
        }
        addCommand.call();
        RevCommit revCommit = clientRepo.commit().setMessage("committing").call();
        clientRepo.push().setRemote("origin").setCredentialsProvider(credentialsProvider).call();

        return revCommit.getId();
    }
}
