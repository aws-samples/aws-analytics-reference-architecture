package com.geekoosh.flyway.request;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.json.JSONObject;

import java.util.List;

public class GitRequest {
    private static final Logger logger = LogManager.getLogger(GitRequest.class);

    private String gitRepository;
    private String gitBranch;
    private String commit;
    private List<String> folders;
    private String username;
    private String password;
    private Boolean reuseRepo;

    public String getGitRepository() {
        return gitRepository;
    }

    public GitRequest setGitRepository(String gitRepository) {
        this.gitRepository = gitRepository;
        return this;
    }

    public String getGitBranch() {
        return gitBranch;
    }

    public GitRequest setGitBranch(String gitBranch) {
        this.gitBranch = gitBranch;
        return this;
    }

    public List<String> getFolders() {
        return folders;
    }

    public GitRequest setFolders(List<String> folders) {
        this.folders = folders;
        return this;
    }

    public String getUsername() {
        return username;
    }

    public GitRequest setUsername(String username) {
        this.username = username;
        return this;
    }

    public String getPassword() {
        return password;
    }

    public GitRequest setPassword(String password) {
        this.password = password;
        return this;
    }

    public Boolean getReuseRepo() {
        return reuseRepo;
    }

    public String getCommit() {
        return commit;
    }

    public GitRequest setCommit(String commit) {
        this.commit = commit;
        return this;
    }

    public GitRequest setReuseRepo(Boolean reuseRepo) {
        this.reuseRepo = reuseRepo;
        return this;
    }

    public static GitRequest build(GitRequest base) {
        if(base == null) {
            base = new GitRequest();
        }

        SystemEnvironment systemEnvironment = new SystemEnvironment();
        String gitSecret = systemEnvironment.getEnv(SecretVars.GIT_SECRET);
        if(gitSecret != null) {
            JSONObject json = ValueManager.latestSecretJson(gitSecret);
            base.setUsername(json.get("username").toString());
            base.setPassword(json.get("password").toString());

            logger.info("Using secret git variables");
        } else {
            base.setUsername(ValueManager.value(
                    base.getUsername(), EnvironmentVars.GIT_USERNAME
            ));
            base.setPassword(ValueManager.value(
                    base.getPassword(), EnvironmentVars.GIT_PASSWORD
            ));
        }
        base.setGitRepository(ValueManager.value(
                base.getGitRepository(), EnvironmentVars.GIT_REPOSITORY
        ));
        base.setGitBranch(ValueManager.value(
                base.getGitBranch(), EnvironmentVars.GIT_BRANCH
        ));
        base.setFolders(
                ValueManager.splitValue(
                        base.getFolders(),
                        EnvironmentVars.GIT_FOLDERS
                )
        );
        base.setReuseRepo(
                ValueManager.boolValue(
                        base.getReuseRepo(),
                        EnvironmentVars.GIT_REUSE_REPO
                )
        );
        return base;
    }
}
