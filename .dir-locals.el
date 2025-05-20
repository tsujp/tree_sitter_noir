((nil . ((project-vc-name . "tree_sitter_noir")))
 ("noir/" . ((nil . ((auto-save-mode . 0)
                     (backup-inhibited . t)
                     (buffer-read-only . t)))))
                     ;; (kill-buffer-delete-auto-save-files . t)))))
 ;; XXX: Not using require because then a provide in ox-ngd and ox-tst would be required, and we'd have to modify the load-path here too. If the day comes ox-ngd and ox-tst won't change a lot we can swap to a require but for now reloading them every time is best.
 (org-mode . ((eval . (progn
                        (require 'org-inlinetask)
                        (load (expand-file-name "ox-ngd.el") nil t t)
                        (load (expand-file-name "ox-tst.el") nil t t)))
              (eval . (progn
                        ;; TODO: Probably just use file-truename providing buffer-name instead of the expand-file-name etc.
                        (let ((bn (file-relative-name buffer-file-truename)))
                          (cond ((string= bn "noir_grammar.org")
                                 (setq-local org-todo-keyword-faces '(("TOIMPL" . org-warning)
                                                                      ("BLOCK" . org-verbatim)
                                                                      ("SPEC" . eldoc-highlight-function-argument)))
                                 (setq-local org-babel-header-args:js '((treesit . :any))))
                                ((string= bn "test.org")
                                 (add-hook 'after-save-hook #'tst-export-current 0 t)))))))))

;; XXX: Had to do cond hack because .dir-locals.el applies after a file is loaded and its local variables read meaning we cannot use enable-local-variables :all specifically for that buffer-local context _before_ the file-local variables are read. Maybe ask about this in the emacs-devel ml because this means that STILl you can only globally trust settings which is fucking insane. Also the new trusted-content pointed at the file does nothing either. It should not be this hard to say "hey, for this file fuck off and let me set 'risky' variables without me having to GLOBALLY trust them".
