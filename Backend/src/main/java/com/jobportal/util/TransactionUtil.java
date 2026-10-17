package com.jobportal.util;

import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

public final class TransactionUtil {

    private TransactionUtil() {
    }

    /**
     * Runs the task after the current transaction commits (so emails and file deletes
     * never happen for a transaction that rolls back). Without a transaction it runs at once.
     */
    public static void afterCommit(Runnable task) {
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    task.run();
                }
            });
        } else {
            task.run();
        }
    }
}