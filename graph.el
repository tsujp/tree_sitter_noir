;;; -*- lexical-binding: t -*-

;; FUTURE JORDAN: Mark a node in bold red if it's todo, and in bold orange if it's to-implement (that is, the rendered graphviz styles) so we can see what we're doing at a glance.
;; FUTURE JORDAN: Perhaps take inspo from alphapapa's org-graph-view stuff and rather render out the structure with colours indicating deeper levels in the tree.
;; FUTURE JORDAN: Somehow mark recursive nodes? That is ones that go back to any of their parents.
;; FUTURE JORDAN: Redo node-construction logic akin to how org-graph-view does? https://github.com/alphapapa/org-graph-view/blob/master/org-graph-view.el#L312

;; cli command render to svg: dot -Tsvg gv2.dot > gv_out.html
;;
;; cairo version cannot be ctrl+f'd over: dot -Tsvg:cairo gv2.dot > gv_out.html

(cl-defstruct kode
  name id children cluster todo-state)

(defun tjp/make-kodes ()
  (when-let* ((org-buf (find-buffer-visiting "/Users/tsujp/prog/tree_sitter_noir/noir_grammar.org"))
              (tree (with-current-buffer org-buf (org-element-parse-buffer)))
              (structure-root (org-element-map tree 'headline
                                (lambda (hl)
                                  (when (member "bingbong" (org-element-property :tags hl))
                                    hl))
                                nil
                                t)))
    (message "---------------\nROOT HEADLINE: %s" (org-element-property :title structure-root))

    (with-current-buffer org-buf ;; Need to find CUSTOM_ID so ensure we're in noir_grammar.org
      (let ((dd (org-element-map structure-root 'drawer
                  (lambda (drw)
                    (when-let* ((hl (org-export-get-parent-headline drw))
                                (hl-tags (org-element-property :tags hl))
                                ((and
                                  (string= "pgd" (org-element-property :drawer-name drw))
                                  (seq-some (lambda (e)
                                              (seq-contains-p '("node" "leaf") e))
                                            hl-tags))))

                      (let ((tk (make-kode :name (org-element-property :raw-value hl)
                                           :id (org-element-property :CUSTOM_ID hl)
                                           :cluster (member "cluster" hl-tags)
                                           :children (list)
                                           :todo-state (org-element-property :todo-keyword hl)
                                           )))
                        
                        (org-element-map drw 'link
                          (lambda (lnk)
                            ;; TODO: Get rid of duplicates, i.e. like in TupleElement where the pgd block has Type twice, we only want to capture the one unique occurance (by the links ID, not the descroiption (which may be correct)).
                            ;; TODO: If a link has been grabbed (from pgd) but the associated target headline doesnt have a node or leaf tag we should set a field on kode so we know its incomplete in the final render (e.g. as of right now that'd be ResolvedType and InternedType under PrimitiveType as neither of those two headlines have said tags).
                            
                            ;; TODO: org-entry-properties looks like the old org api idk? Ask on IRC perhaps? Going to try with org-element instead
                            ;; (org-entry-properties (org-find-property "CUSTOM_ID" (org-element-property :path lnk)) "item")

                            ;; Only attempt to resolve links which are to CUSTOM_ID
                            (when-let* ((dest-hl
                                         (when (string= (org-element-property :type lnk) "custom-id")
                                           (org-element-at-point
                                            (org-find-property "CUSTOM_ID" (org-element-property :path lnk)) "item")))
                                        (dest-hl-name (org-element-property :raw-value dest-hl))
                                        ((not (member dest-hl-name (kode-children tk)))))
                              (when (not (member "lex" (org-element-property :tags dest-hl)))
                              
                                (push dest-hl-name (kode-children tk))))

                            ;; Not the most efficient (checking every time) but it'll do for now.
                            ;; (when (not (member (org-element-interpret-data (org-element-contents lnk)) (kode-children tk)))
                            ;;   (push (org-element-interpret-data (org-element-contents lnk))
                            ;;         (kode-children tk)))
                            )
                          nil nil 'link)        ; link map
                        tk)
                      ))                      ; drawer map
                  )))
        ;; (message "\nDONE: %s\n" (flatten-list dd))
        (dolist (d dd)
          (message "-> %s" d))
        dd))))
      ;; (flatten-list dd))))
      ;; dd)))
;; (tjp/make-kodes)


(defun tjp/make-graphviz-buffer ()
  (interactive)
  (let* ((dd (tjp/make-kodes))
         (base-path
          (project-root (project-current
                         nil
                         (directory-file-name "/Users/tsujp/prog/tree_sitter_noir/noir_grammar.org")))))
    (with-current-buffer
        ;; (switch-to-buffer-other-window "*graphviz-dump*")
        (get-buffer-create "gv2.dot")
      (setq buffer-file-name (expand-file-name "gv2.dot" base-path))
      (kill-all-local-variables)
      (erase-buffer)
      (remove-overlays)

      (insert "digraph parser_hierarchy {\n")

      (insert "fontname=\"Helvetica,Arial,sans-serif\"\nfontsize=\"11\"\n")
      (insert "node [fontname=\"Helvetica,Arial,sans-serif\" fontsize=\"11\"]\n")
      (insert "edge [fontname=\"Helvetica,Arial,sans-serif\"]\n")
      (insert "graph [center=1 overlap=false rankdir=LR concentrate=true splines=true ratio=auto mclimit=3]\n")

      (insert "\nsubgraph implemented {
//node [style=bold]
node [pendwidth=3]
edge [style=dotted]
Type
}\n\n")
      
      (dolist (d dd)
        ;; TODO: All of this stuff is ugly, checking multiple times etc all should be redone later on.
        
        (pcase (kode-todo-state d)
          ("TODO" (insert (kode-name d) " [color=red penwidth=2]\n"))
          ("TOIMPL" (insert (kode-name d) " [color=darkorange]\n"))
          ("BLOCK" (insert (kode-name d) " [color=deeppink penwidth=3]\n")))
        
        (when (kode-cluster d)
          (insert "\nsubgraph grp_" (kode-name d) " {\n")
          )

        (if (kode-children d)
            (insert (kode-name d) " -> {" (mapconcat #'identity (kode-children d) " ") "}\n"))
        
            ;; (insert (mapconcat (lambda (child)
            ;;                      (format "%s -> %s\n" (kode-name d) child)
            ;;                      )
            ;;                    (kode-children d) "")))

        (when (kode-cluster d)
          (insert "}\n")))
        
        ;; (if (kode-children d)
        ;;     (insert " -> {" (mapconcat #'identity (kode-children d) " ") "}\n")
        ;;   (insert " [shape=box]\n")))
        
        ;; (insert
        ;;  (format "%s" (car (kode-parent d)))
        ;;  " -> "
        ;;  (kode-name d)
        ;;  "\n"
        ;;  ))

      (insert "}\n")
      (save-buffer)
      )))
