(ns runway.endpoint.assets
  (:require [compojure.core :refer :all]
            [compojure.route :refer [resources]]))

(defn assets-endpoint [config]
  (context "/assets" []
           (resources "/" {:root "runway/public"})))
