(ns runway.endpoint.home
  (:require [compojure.core :refer :all]
            [net.cgrand.enlive-html :as html]))


(html/deftemplate app-templ "runway/html/app.html"
  [])

(defn home-endpoint [{{db :spec} :db}]
  (GET "/" []
       {:status  200
        :headers {"content-type" "text/html"}
        :body    (app-templ)}))
