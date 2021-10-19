package com.geekoosh.lambda.git;

import com.geekoosh.flyway.request.GitRequest;
import com.geekoosh.lambda.MigrationFilesException;
import com.geekoosh.lambda.MigrationFilesService;
import org.apache.commons.io.FileUtils;
import org.apache.commons.lang3.RandomStringUtils;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.eclipse.jgit.api.CloneCommand;
import org.eclipse.jgit.api.Git;
import org.eclipse.jgit.api.PullCommand;
import org.eclipse.jgit.api.errors.GitAPIException;
import org.eclipse.jgit.lib.Ref;
import org.eclipse.jgit.transport.UsernamePasswordCredentialsProvider;

import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

public class GitService implements MigrationFilesService{
    private static final Logger logger = LogManager.getLogger(GitService.class);
    private static final String basePath = "/tmp";

    private File gitDirectory;
    private Git repo;
    private GitRequest gitRequest;

    public GitService(String localRepo, GitRequest gitRequest) {
        this.gitRequest = gitRequest;
        this.gitDirectory = new File(basePath + "/" + localRepo);
    }
    public GitService(GitRequest gitRequest) {
        this("gitrepo", gitRequest);
    }

    private String branch() {
        return gitRequest.getGitBranch() != null ? gitRequest.getGitBranch() : "master";
    }
    private String branchRef() {
        return String.format("refs/heads/%s", branch());
    }

    public void cloneRepo() throws MigrationFilesException {
        if(gitDirectory.exists()) {
            try {
                FileUtils.deleteDirectory(gitDirectory);
            } catch (IOException e) {
                throw new MigrationFilesException("Failed deleting existing git directory", e);
            }
        }
        if(!gitDirectory.mkdir()) {
            throw new MigrationFilesException("Git directory creation failed");
        }
        logger.info("Fetching from " + gitRequest.getGitRepository());
        logger.info("Fetching from branch " + branchRef());

        CloneCommand cloneCmd = Git.cloneRepository();
        if(gitRequest.getUsername() != null && gitRequest.getPassword() != null) {
            cloneCmd = cloneCmd.setCredentialsProvider(new UsernamePasswordCredentialsProvider(
                    gitRequest.getUsername(), gitRequest.getPassword()
            ));
        }
        cloneCmd
                .setURI(gitRequest.getGitRepository())
                .setBranchesToClone(Collections.singletonList(branchRef()))
                .setBranch(branchRef())
                .setDirectory(gitDirectory)
                .setRemote("origin");
        try {
            repo = cloneCmd.call();
        } catch (GitAPIException e) {
            throw new MigrationFilesException("Failed cloning repo", e);
        }
        checkout();
    }

    private Git getRepo() throws IOException {
        if(repo == null) {
            try {
                repo = Git.open(gitDirectory);
            } catch (IOException e) {
                logger.error("Failed opening git repo", e);
                throw e;
            }
        }
        return repo;
    }
    private boolean repoExists() {
        try {
            getRepo();
            return true;
        } catch (IOException e) {
            return false;
        }
    }

    public void pullRepo() throws MigrationFilesException {
        try {
            PullCommand pullCommand = getRepo().pull();
            pullCommand
                    .setCredentialsProvider(new UsernamePasswordCredentialsProvider(
                            gitRequest.getUsername(), gitRequest.getPassword()
                    ));
                    //.setRemoteBranchName(branchRef())
                    //.setRemote("origin");
            logger.info("Pulling from branch " + branchRef());

            pullCommand.call();
        } catch (GitAPIException | IOException e) {
            throw new MigrationFilesException("Failed pulling branch " + branchRef(), e);
        }
        checkout();
    }

    private String createTempBranchName() throws IOException, GitAPIException {
        boolean found = true;
        String branchName = RandomStringUtils.randomAlphabetic(15);
        while(found) {
            List<Ref> refs = getRepo().branchList().call();
            found = refs.stream().anyMatch(ref -> ref.getName().equals(branchName));
        }
        return branchName;
    }

    public void checkout() throws MigrationFilesException {
        if(gitRequest.getCommit() != null) {
            try {
                getRepo().checkout().setCreateBranch(true).setName(createTempBranchName()).setStartPoint(gitRequest.getCommit()).call();
            } catch (GitAPIException | IOException e) {
                throw new MigrationFilesException("Failed checking out commit " + gitRequest.getCommit(), e);
            }
        }
    }

    public void cloneOrPull() throws MigrationFilesException {
        if(repoExists()) {
            pullRepo();
        } else {
            cloneRepo();
        }
    }

    public void removeRepo() throws MigrationFilesException {
        try {
            FileUtils.deleteDirectory(gitDirectory);
        } catch (IOException e) {
            logger.error("Failed deleting existing git directory", e);
            throw new MigrationFilesException("Failed deleting existing git directory", e);
        }
    }
    public boolean hasFile(String path) {
        return Paths.get(gitDirectory.getPath(), path).toFile().exists();
    }

    @Override
    public boolean isValid() {
        return this.gitRequest.getGitRepository() != null;
    }

    @Override
    public void prepare() throws MigrationFilesException {
        try {
            if (gitRequest.getReuseRepo()) {
                cloneOrPull();
            } else {
                cloneRepo();
            }
        } catch(Exception e) {
            throw new MigrationFilesException(e);
        }
    }

    @Override
    public List<String> getFolders() {
        return gitRequest.getFolders().size() == 0 ?
                Collections.singletonList(gitDirectory.getPath()) :
                    gitRequest.getFolders()
                    .stream().map(this::getPath).collect(Collectors.toList());
    }

    @Override
    public void clean() throws MigrationFilesException {
        try {
            if (!gitRequest.getReuseRepo()) {
                removeRepo();
            }
        } catch(Exception e) {
            throw new MigrationFilesException(e);
        }
    }

    @Override
    public String getPath(String path) {
        return Paths.get(gitDirectory.getPath(), path).toString();
    }

    public void forceClean() throws MigrationFilesException {
        removeRepo();
    }
}
