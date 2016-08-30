(defproject org.akvo.lumen "0.2-SNAPSHOT"
  :description "Akvo Lumen backend"
  :url "https://github.com/akvo/akvo-lumen"
  :license {:name "GNU Affero General Public License 3.0"
            :url  "https://www.gnu.org/licenses/agpl-3.0.html"}
  :min-lein-version "2.0.0"
  :dependencies [[cheshire "5.6.3"]
                 [clj-http "3.2.0"]
                 [clj-time "0.12.0"]
                 [com.ibm.icu/icu4j "57.1"]
                 [com.layerware/hugsql "0.4.7"]
                 [com.stuartsierra/component "0.3.1"]
                 [compojure "1.5.1"]
                 [duct "0.8.0"]
                 [duct/hikaricp-component "0.1.0"]
                 [environ "1.1.0"]
                 [meta-merge "1.0.0"]
                 [org.akvo/commons "0.4.4-SNAPSHOT"
                  :exclusions [org.postgresql/postgresql org.clojure/java.jdbc]]
                 [org.akvo/resumed "0.1.0-SNAPSHOT"]
                 [org.apache.tika/tika-core "1.13"]
                 [org.clojure/clojure "1.8.0"]
                 [org.clojure/data.csv "0.1.3"]
                 [org.immutant/scheduling "2.1.5" :exclusions [ch.qos.logback/logback-classic]]
                 [org.immutant/web "2.1.5"]
                 [org.postgresql/postgresql "9.4.1209"]
                 [org.slf4j/slf4j-nop "1.7.21"]
                 [ragtime/ragtime.jdbc "0.6.3"]
                 [ring "1.5.0"]
                 [ring/ring-defaults "0.2.1"]
                 [ring/ring-json "0.4.0"]]
  :uberjar-name "akvo-lumen.jar"
  :repl-options {:timeout 120000}
  :plugins [[lein-codox "0.9.6"]
            [lein-environ "1.0.3"]]
  :codox {:doc-paths   ["resources/org/akvo/lumen/doc"]
          :output-path "doc"}
  :main ^:skip-aot org.akvo.lumen.main
  :target-path "target/%s/"
  :aliases {"setup"   ["run" "-m" "duct.util.repl/setup"]
            "migrate" ["run" "-m" "dev/migrate"]
            "seed"    ["run" "-m" "dev/seed"]}
  :test-selectors {:default (and (constantly true)
                                 (complement :functional))
                   :all     (constantly true)}
  :profiles
  {:dev           [:project/dev  :profiles/dev]
   :test          [:project/test :profiles/test]
   :uberjar       {:aot :all}
   :profiles/dev  {}
   :profiles/test {}
   :project/dev   {:dependencies   [[duct/generate "0.8.0"]
                                    [reloaded.repl "0.2.2"]
                                    [org.clojure/tools.namespace "0.2.11"]
                                    [org.clojure/tools.nrepl "0.2.12"]
                                    [eftest "0.1.1"]
                                    [com.gearswithingears/shrubbery "0.4.0"]
                                    [kerodon "0.8.0"]]
                   :source-paths   ["dev/src"]
                   :resource-paths ["dev/resources" "test/resources"]
                   :repl-options   {:init-ns user}
                   :env            {:port "3000"}}
   :project/test  {:resource-paths ["test/resources"]
                   :env
                   {:db {:uri "jdbc:postgresql://localhost/lumen?user=lumen&password=password"}}}})
