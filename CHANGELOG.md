# Changelog

## [0.25.2](https://github.com/external-secrets-inc/web-ui/compare/v0.25.1...v0.25.2) (2025-08-13)


### Bug Fixes

* timeout ([c35ba10](https://github.com/external-secrets-inc/web-ui/commit/c35ba100aac7866eb46c6c15c19bf43b10a37d08))

## [0.25.1](https://github.com/external-secrets-inc/web-ui/compare/v0.25.0...v0.25.1) (2025-08-13)


### Bug Fixes

* build for arm64 ([#485](https://github.com/external-secrets-inc/web-ui/issues/485)) ([df5cbbc](https://github.com/external-secrets-inc/web-ui/commit/df5cbbc0243271150e83e8f56d205ea0e6578d65))

## [0.25.0](https://github.com/external-secrets-inc/web-ui/compare/v0.24.0...v0.25.0) (2025-08-12)


### Features

* restructure navigation, urls and namings for improved organization ([#481](https://github.com/external-secrets-inc/web-ui/issues/481)) ([bfaadf7](https://github.com/external-secrets-inc/web-ui/commit/bfaadf70fdb1d5af8428c96363bf6f1bead95913))


### Bug Fixes

* delete click propagation on generator table ([#479](https://github.com/external-secrets-inc/web-ui/issues/479)) ([fbd16d7](https://github.com/external-secrets-inc/web-ui/commit/fbd16d796e1906592e724b76bc1342b06a6f0ea1))
* old paths replacement ([#484](https://github.com/external-secrets-inc/web-ui/issues/484)) ([4686957](https://github.com/external-secrets-inc/web-ui/commit/4686957ea5500a4e2d3c224e2f5e752ea443f01f))
* update labels to match eso-server ([#483](https://github.com/external-secrets-inc/web-ui/issues/483)) ([981419d](https://github.com/external-secrets-inc/web-ui/commit/981419d3dbd6cbb5eac0a740c5dc70d642a42864))

## [0.24.0](https://github.com/external-secrets-inc/web-ui/compare/v0.23.2...v0.24.0) (2025-08-08)


### Features

* add edit screen for secretstores ([#477](https://github.com/external-secrets-inc/web-ui/issues/477)) ([934ded6](https://github.com/external-secrets-inc/web-ui/commit/934ded65cfab399f04259d975d04d711ba344e30))
* add generator details ([#462](https://github.com/external-secrets-inc/web-ui/issues/462)) ([84dec73](https://github.com/external-secrets-inc/web-ui/commit/84dec7317a82fa9cdf702e949ef3b41a2b31326d))
* add groups on multiselect and select components ([#469](https://github.com/external-secrets-inc/web-ui/issues/469)) ([c260faf](https://github.com/external-secrets-inc/web-ui/commit/c260faf1d3040e4ba5e50a4e5e7982601de37590))
* add secrets pages and services ([#459](https://github.com/external-secrets-inc/web-ui/issues/459)) ([305906a](https://github.com/external-secrets-inc/web-ui/commit/305906a1233fccab2441a652ad5180b92b5d1776))
* create service account screens and services ([#475](https://github.com/external-secrets-inc/web-ui/issues/475)) ([ce827cb](https://github.com/external-secrets-inc/web-ui/commit/ce827cb2be95231b7b36484134254e1ea662fb86))


### Bug Fixes

* add description and run templates amount to workflow template datatable ([#472](https://github.com/external-secrets-inc/web-ui/issues/472)) ([050f73f](https://github.com/external-secrets-inc/web-ui/commit/050f73fc1d1b1eb1dd0accf85696e1c492bbcdc9))
* update findings and secretStores models ([#470](https://github.com/external-secrets-inc/web-ui/issues/470)) ([33d622e](https://github.com/external-secrets-inc/web-ui/commit/33d622e0d169c620bf32a4cdf75f97e9d56debe9))
* workflow run parameters render ([#461](https://github.com/external-secrets-inc/web-ui/issues/461)) ([25d60d3](https://github.com/external-secrets-inc/web-ui/commit/25d60d3cb0f2dd67fd1737b02cdedf1d1be378b7))

## [0.23.2](https://github.com/external-secrets-inc/web-ui/compare/v0.23.1...v0.23.2) (2025-08-01)


### Bug Fixes

* create token before trigger ([397e40e](https://github.com/external-secrets-inc/web-ui/commit/397e40ea2065e6a09830e2645e7000d407509486))

## [0.23.1](https://github.com/external-secrets-inc/web-ui/compare/v0.23.0...v0.23.1) (2025-08-01)


### Bug Fixes

* trigger auto bump on helm builds ([#464](https://github.com/external-secrets-inc/web-ui/issues/464)) ([e4c9338](https://github.com/external-secrets-inc/web-ui/commit/e4c9338558938f9671c7f13d685b241bdaea9905))

## [0.23.0](https://github.com/external-secrets-inc/web-ui/compare/v0.22.2...v0.23.0) (2025-08-01)


### Features

* add Workflow Targets management functionality ([54cf8c3](https://github.com/external-secrets-inc/web-ui/commit/54cf8c39032a152d2a1e2bb9a65a0ad3aecd12e6))
* add workflow targets management interface ([#455](https://github.com/external-secrets-inc/web-ui/issues/455)) ([54cf8c3](https://github.com/external-secrets-inc/web-ui/commit/54cf8c39032a152d2a1e2bb9a65a0ad3aecd12e6))
* helm bumps on release please ([#463](https://github.com/external-secrets-inc/web-ui/issues/463)) ([ac70754](https://github.com/external-secrets-inc/web-ui/commit/ac70754a3e078dc94cc0e9c69a81011e0e87cda4))
* push charts to public registry ([#449](https://github.com/external-secrets-inc/web-ui/issues/449)) ([795be48](https://github.com/external-secrets-inc/web-ui/commit/795be483a45bd13aabe10bdd1cf47a3636a25a34))
* push Docker images to public registry ([#439](https://github.com/external-secrets-inc/web-ui/issues/439)) ([4a7543d](https://github.com/external-secrets-inc/web-ui/commit/4a7543d40b0b436394c81e7f3763871c07b15f7f))
* push Helm charts to both internal and public registries ([795be48](https://github.com/external-secrets-inc/web-ui/commit/795be483a45bd13aabe10bdd1cf47a3636a25a34))


### Bug Fixes

* reference on gha ([2b701c0](https://github.com/external-secrets-inc/web-ui/commit/2b701c07d0423a3dc797067237bdc916eead2d56))
* support custom ports ([#450](https://github.com/external-secrets-inc/web-ui/issues/450)) ([4f6ae16](https://github.com/external-secrets-inc/web-ui/commit/4f6ae16853d2c65f75db065c4999f56b332185a9))
* update visible when logic ([#457](https://github.com/external-secrets-inc/web-ui/issues/457)) ([79d1a23](https://github.com/external-secrets-inc/web-ui/commit/79d1a237402283f97dc1043000306644930bb0dc))
* wildcard ([#447](https://github.com/external-secrets-inc/web-ui/issues/447)) ([34d7463](https://github.com/external-secrets-inc/web-ui/commit/34d7463a32311f1b249245a537666108ba2e71f1))

## [0.22.2](https://github.com/external-secrets-inc/web-ui/compare/v0.22.1...v0.22.2) (2025-07-23)


### Bug Fixes

* support global config on web-ui ([#445](https://github.com/external-secrets-inc/web-ui/issues/445)) ([45ba892](https://github.com/external-secrets-inc/web-ui/commit/45ba89291a6d37caeb5a95913b342ce7645491e5))

## [0.22.1](https://github.com/external-secrets-inc/web-ui/compare/v0.22.0...v0.22.1) (2025-07-21)


### Bug Fixes

* minor fixes ([#444](https://github.com/external-secrets-inc/web-ui/issues/444)) ([c781e1f](https://github.com/external-secrets-inc/web-ui/commit/c781e1f344777d416a53e09eb73bc7aea6cc3d6c))
* use static file replace for assets ([#442](https://github.com/external-secrets-inc/web-ui/issues/442)) ([02e0e81](https://github.com/external-secrets-inc/web-ui/commit/02e0e81e79477f19d4b86213a7dd57057de0a7c8))

## [0.22.0](https://github.com/external-secrets-inc/web-ui/compare/v0.21.0...v0.22.0) (2025-07-17)


### Features

* improve WorkflowRunTemplate status UX and add back button to pages based on breadcrumb size ([#433](https://github.com/external-secrets-inc/web-ui/issues/433)) ([39a0186](https://github.com/external-secrets-inc/web-ui/commit/39a0186f1a01c0cc479693c393b5e022ecd6573e))

## [0.21.0](https://github.com/external-secrets-inc/web-ui/compare/v0.20.0...v0.21.0) (2025-07-16)


### Features

* :sparkles: enhance EsiSchemaForm to support skipNesting option and refactor internal field resolution ([c3d4884](https://github.com/external-secrets-inc/web-ui/commit/c3d4884354bce4be36be38d3882d9abb534ae843))
* enhance EsiSchemaForm to support skipNesting option and refactor internal field resolution ([#432](https://github.com/external-secrets-inc/web-ui/issues/432)) ([c3d4884](https://github.com/external-secrets-inc/web-ui/commit/c3d4884354bce4be36be38d3882d9abb534ae843))


### Bug Fixes

* add one more check to flatten nested structure hack ([#430](https://github.com/external-secrets-inc/web-ui/issues/430)) ([77f4c3f](https://github.com/external-secrets-inc/web-ui/commit/77f4c3f6756c739b0c9c5cb7c10a5cf8df986623))

## [0.20.0](https://github.com/external-secrets-inc/web-ui/compare/v0.19.1...v0.20.0) (2025-07-15)


### Features

* enhance EsiSchemaForm with valueRef support for complex object values ([#426](https://github.com/external-secrets-inc/web-ui/issues/426)) ([49b1505](https://github.com/external-secrets-inc/web-ui/commit/49b1505d0853ac6f26aefd25e47dc9817b95a50e))

## [0.19.1](https://github.com/external-secrets-inc/web-ui/compare/v0.19.0...v0.19.1) (2025-07-15)


### Bug Fixes

* oneof subselect inheriting read only ([#424](https://github.com/external-secrets-inc/web-ui/issues/424)) ([7c9ceb3](https://github.com/external-secrets-inc/web-ui/commit/7c9ceb3e4a02e7b24f13d09d2ff0d7c549a41aeb))

## [0.19.0](https://github.com/external-secrets-inc/web-ui/compare/v0.18.0...v0.19.0) (2025-07-15)


### Features

* add query parameter to workflow template creation when redirected from findings ([#422](https://github.com/external-secrets-inc/web-ui/issues/422)) ([49e5144](https://github.com/external-secrets-inc/web-ui/commit/49e5144b74c15301c08c438f125c783176a72aba))

## [0.18.0](https://github.com/external-secrets-inc/web-ui/compare/v0.17.0...v0.18.0) (2025-07-10)


### Features

* :sparkles: add support for eso findings ([45b15da](https://github.com/external-secrets-inc/web-ui/commit/45b15da1436229fd0f7fc67a9f10235ed12066fe))
* add support for eso findings ([#421](https://github.com/external-secrets-inc/web-ui/issues/421)) ([45b15da](https://github.com/external-secrets-inc/web-ui/commit/45b15da1436229fd0f7fc67a9f10235ed12066fe))


### Bug Fixes

* remove namespace from workflow screens; fix generators validation for yamls ([d7bd0f8](https://github.com/external-secrets-inc/web-ui/commit/d7bd0f82914a7f2c6e0bf4d9f3b9217c6944fa22))
* remove namespaces ([#413](https://github.com/external-secrets-inc/web-ui/issues/413)) ([d7bd0f8](https://github.com/external-secrets-inc/web-ui/commit/d7bd0f82914a7f2c6e0bf4d9f3b9217c6944fa22))
* support runtime for workflow run and workflow ([#412](https://github.com/external-secrets-inc/web-ui/issues/412)) ([3dcc653](https://github.com/external-secrets-inc/web-ui/commit/3dcc653cb2a40b3ba62eba7b08d5e706abb51022))

## [0.17.0](https://github.com/external-secrets-inc/web-ui/compare/v0.16.0...v0.17.0) (2025-07-04)


### Features

* workflow generators screens ([#403](https://github.com/external-secrets-inc/web-ui/issues/403)) ([35e9106](https://github.com/external-secrets-inc/web-ui/commit/35e9106174689c2d703fce15769f8ab48230cb65))


### Bug Fixes

* :bug: boolean fields being badly validated and send actual boolean values ([3ab56f4](https://github.com/external-secrets-inc/web-ui/commit/3ab56f45a3cbcae341b4f76d2022c929795a5586))
* add workflow graph to workflow template create page ([#399](https://github.com/external-secrets-inc/web-ui/issues/399)) ([0410cb2](https://github.com/external-secrets-inc/web-ui/commit/0410cb26b4bc39c0c371a63609820138453c8ad2))
* ensure proper validation of boolean fields and return actual boolean values ([#411](https://github.com/external-secrets-inc/web-ui/issues/411)) ([3ab56f4](https://github.com/external-secrets-inc/web-ui/commit/3ab56f45a3cbcae341b4f76d2022c929795a5586))

## [0.16.0](https://github.com/external-secrets-inc/web-ui/compare/v0.15.0...v0.16.0) (2025-07-01)


### Features

* :lipstick: add components necessary for sidebar ([5f37462](https://github.com/external-secrets-inc/web-ui/commit/5f374627ec67165fd10a7058ce8dcf35743366cd))
* :sparkles: add google oauth login only support ([a704b7c](https://github.com/external-secrets-inc/web-ui/commit/a704b7c0dda2b1d94d4c7e20af7cafb31fb2e49a))
* :sparkles: dynamic form baseline for workflow template ([#385](https://github.com/external-secrets-inc/web-ui/issues/385)) ([e991265](https://github.com/external-secrets-inc/web-ui/commit/e991265a8098140d57f15598e8fdd96e912c8195))
* :sparkles: suppor readOnly for fields in schema form ([3bf8245](https://github.com/external-secrets-inc/web-ui/commit/3bf824567c686cc0a5233bc1c0c58818fa06499c))
* :sparkles: support schema form for run templates ([17e1388](https://github.com/external-secrets-inc/web-ui/commit/17e1388fc0f01cef9ebdbb15738e3917967e90e7))
* ✨ support eso server as a backend ([#379](https://github.com/external-secrets-inc/web-ui/issues/379)) ([a7238b9](https://github.com/external-secrets-inc/web-ui/commit/a7238b9199c8b7e0b485a12272e2f63e1be4eecb))
* ✨ workflows secret stores ([#380](https://github.com/external-secrets-inc/web-ui/issues/380)) ([6ede07a](https://github.com/external-secrets-inc/web-ui/commit/6ede07a00e45499fd458e82d556a1fb1bcacd35e))
* add components necessary for sidebar ([#364](https://github.com/external-secrets-inc/web-ui/issues/364)) ([5f37462](https://github.com/external-secrets-inc/web-ui/commit/5f374627ec67165fd10a7058ce8dcf35743366cd))
* add list workflow template ([#381](https://github.com/external-secrets-inc/web-ui/issues/381)) ([74e889f](https://github.com/external-secrets-inc/web-ui/commit/74e889f6ddf662de17b427932e60121e1e6f32d7))
* add more details to workflow template screen ([#395](https://github.com/external-secrets-inc/web-ui/issues/395)) ([3ed2f45](https://github.com/external-secrets-inc/web-ui/commit/3ed2f45c2c245216ce1188ad52b9b3a03ebaf686))
* **auth:** 1 overhaul authentication flow and components ([#359](https://github.com/external-secrets-inc/web-ui/issues/359)) ([a704b7c](https://github.com/external-secrets-inc/web-ui/commit/a704b7c0dda2b1d94d4c7e20af7cafb31fb2e49a))
* **data-provider:** 1 DataProvider refactor with virtualization strategies ([#353](https://github.com/external-secrets-inc/web-ui/issues/353)) ([12efe90](https://github.com/external-secrets-inc/web-ui/commit/12efe9095b5c63106fea2904f312018ebd31a823))
* **data-provider:** 2 refactored DataProvider new stories ([#354](https://github.com/external-secrets-inc/web-ui/issues/354)) ([03fba51](https://github.com/external-secrets-inc/web-ui/commit/03fba51a4a5f23d911c2173e5c7d933925c37ca1))
* **data-provider:** 3 audit mocks and feature flag improvements ([#355](https://github.com/external-secrets-inc/web-ui/issues/355)) ([a4b1b42](https://github.com/external-secrets-inc/web-ui/commit/a4b1b42e1256cd934c7da5e39c37a92727e7e5c6))
* job status ordering by dependsOn ([#398](https://github.com/external-secrets-inc/web-ui/issues/398)) ([3d5eb7a](https://github.com/external-secrets-inc/web-ui/commit/3d5eb7ab8ff2db464567070310070df25420244a))
* redesign UI with new layout and theme ([#365](https://github.com/external-secrets-inc/web-ui/issues/365)) ([59b0c27](https://github.com/external-secrets-inc/web-ui/commit/59b0c2779601b30f3bf61761a99045e20e6ccf4f))
* support api options for selects with href in oneOf ([#391](https://github.com/external-secrets-inc/web-ui/issues/391)) ([3bf8245](https://github.com/external-secrets-inc/web-ui/commit/3bf824567c686cc0a5233bc1c0c58818fa06499c))
* support dynamic forms for secret stores ([#382](https://github.com/external-secrets-inc/web-ui/issues/382)) ([5c1a3e2](https://github.com/external-secrets-inc/web-ui/commit/5c1a3e2b26ee0163e4c320fd890304289f280d6b))
* support schema form for run templates ([#401](https://github.com/external-secrets-inc/web-ui/issues/401)) ([17e1388](https://github.com/external-secrets-inc/web-ui/commit/17e1388fc0f01cef9ebdbb15738e3917967e90e7))
* workflow run screen ([#384](https://github.com/external-secrets-inc/web-ui/issues/384)) ([cb89375](https://github.com/external-secrets-inc/web-ui/commit/cb89375b2980a27c41a7ca29ddf85267db690778))
* workflow run template list ([#387](https://github.com/external-secrets-inc/web-ui/issues/387)) ([7201032](https://github.com/external-secrets-inc/web-ui/commit/72010324321eefcd8e03fecb80a1e2c721830d5c))


### Bug Fixes

* :bug: allow filtering out fields that includes __ui_state in their name ([678b289](https://github.com/external-secrets-inc/web-ui/commit/678b289b26c79ff4aa18fa9a4cbeca9d4c03005b))
* :label: fix all consumers of DataProvider to use defineColumns type abstraction ([12efe90](https://github.com/external-secrets-inc/web-ui/commit/12efe9095b5c63106fea2904f312018ebd31a823))
* allow filtering out fields that includes __ui_state in their name ([#389](https://github.com/external-secrets-inc/web-ui/issues/389)) ([678b289](https://github.com/external-secrets-inc/web-ui/commit/678b289b26c79ff4aa18fa9a4cbeca9d4c03005b))
* eso-server url on webui builds ([#400](https://github.com/external-secrets-inc/web-ui/issues/400)) ([7f7ccaa](https://github.com/external-secrets-inc/web-ui/commit/7f7ccaa6b55448409a54141c80bd6f5a3096d6cc))
* one of id support and general improvements ([#386](https://github.com/external-secrets-inc/web-ui/issues/386)) ([3429ab3](https://github.com/external-secrets-inc/web-ui/commit/3429ab3b0ed44feee0e960ab36176846582dc6f3))
* policies trigger mocks and quick code improvements ([#366](https://github.com/external-secrets-inc/web-ui/issues/366)) ([521413b](https://github.com/external-secrets-inc/web-ui/commit/521413bb81bb0adbcb6d5096f7745ed6a3f744bc))
* provider type mock key values ([#350](https://github.com/external-secrets-inc/web-ui/issues/350)) ([0a76464](https://github.com/external-secrets-inc/web-ui/commit/0a764640f50adb6c8599369e71fdbebfb78b9c17))
* small fixes :partying_face: ([#390](https://github.com/external-secrets-inc/web-ui/issues/390)) ([55371a2](https://github.com/external-secrets-inc/web-ui/commit/55371a2c1a71e6d8d0816aec20e252e69591aa49))

## [0.15.0](https://github.com/external-secrets-inc/web-ui/compare/v0.14.1...v0.15.0) (2025-04-24)


### Features

* add destinations ([#335](https://github.com/external-secrets-inc/web-ui/issues/335)) ([cad5443](https://github.com/external-secrets-inc/web-ui/commit/cad544343a53b81f48411978e2cfeb089be77a52))
* add react-query to auth related requests ([#333](https://github.com/external-secrets-inc/web-ui/issues/333)) ([af56602](https://github.com/external-secrets-inc/web-ui/commit/af56602e21f74e7d3bfaec91fd64c83a39ae7841))
* add triggers to policies ([#326](https://github.com/external-secrets-inc/web-ui/issues/326)) ([5f3f7e2](https://github.com/external-secrets-inc/web-ui/commit/5f3f7e2d3a35befcf8c890acb96c22da4308a919))
* replace email service with react query ([#336](https://github.com/external-secrets-inc/web-ui/issues/336)) ([71a8870](https://github.com/external-secrets-inc/web-ui/commit/71a88703b1b2b555bb9bb671eff926781f7d65cb))
* replace forgot password service with react query ([#337](https://github.com/external-secrets-inc/web-ui/issues/337)) ([bd719cc](https://github.com/external-secrets-inc/web-ui/commit/bd719cc461c9c443df5fc556b02766028879ef2a))
* replace old account service with react-query ([#327](https://github.com/external-secrets-inc/web-ui/issues/327)) ([660a360](https://github.com/external-secrets-inc/web-ui/commit/660a36094de9127f14cd0258353e3e8158f29b76))
* replace userService with react-query ([#339](https://github.com/external-secrets-inc/web-ui/issues/339)) ([055f14b](https://github.com/external-secrets-inc/web-ui/commit/055f14bcd9807cb9e792507eb0f858f33b535b45))


### Bug Fixes

* destinations edits and interactions ([#340](https://github.com/external-secrets-inc/web-ui/issues/340)) ([9506b5c](https://github.com/external-secrets-inc/web-ui/commit/9506b5c48f3ceeae1a426ac425c9acd08d3ebbe9))
* root layout after introduction of react query dev tools ([#341](https://github.com/external-secrets-inc/web-ui/issues/341)) ([e66c8ed](https://github.com/external-secrets-inc/web-ui/commit/e66c8ed49c92fc9ef3d269128e7615e2a9869e12))
* update user management table status text and text color ([#320](https://github.com/external-secrets-inc/web-ui/issues/320)) ([2058e24](https://github.com/external-secrets-inc/web-ui/commit/2058e2449a9e234fb9fe25de15fc020392445f01))

## [0.14.1](https://github.com/external-secrets-inc/web-ui/compare/v0.14.0...v0.14.1) (2025-04-09)


### Bug Fixes

* add inactive users to table; add other existent roles to role options ([#318](https://github.com/external-secrets-inc/web-ui/issues/318)) ([5c7963e](https://github.com/external-secrets-inc/web-ui/commit/5c7963e8cd647191b6c7c1461583e6ff999b5d83))

## [0.14.0](https://github.com/external-secrets-inc/web-ui/compare/v0.13.0...v0.14.0) (2025-03-31)


### Features

* add basic setup of storybook ([#313](https://github.com/external-secrets-inc/web-ui/issues/313)) ([9ac70e2](https://github.com/external-secrets-inc/web-ui/commit/9ac70e27ddb8bb098f8bc42d28e00b8e7db88a69))
* Add users management data table with add button ([#315](https://github.com/external-secrets-inc/web-ui/issues/315)) ([05a100b](https://github.com/external-secrets-inc/web-ui/commit/05a100b77c8ee137430ed5fbe5c075f2c2ca4de4))
* improve provider form validation and slug handling ([#310](https://github.com/external-secrets-inc/web-ui/issues/310)) ([f5d6831](https://github.com/external-secrets-inc/web-ui/commit/f5d683181f079d2589ba9da80402409c6ae35eff))


### Bug Fixes

* fixed multiselect search ([#277](https://github.com/external-secrets-inc/web-ui/issues/277)) ([8096e02](https://github.com/external-secrets-inc/web-ui/commit/8096e022405a13f025958730871cbb6b4d10467d))
* update keyvault configs ([#311](https://github.com/external-secrets-inc/web-ui/issues/311)) ([a7c85af](https://github.com/external-secrets-inc/web-ui/commit/a7c85afc7277941901cf5165f296e64632edbdd4))

## [0.13.0](https://github.com/external-secrets-inc/web-ui/compare/v0.12.0...v0.13.0) (2025-03-18)


### Features

* add aws form ([#297](https://github.com/external-secrets-inc/web-ui/issues/297)) ([f17ea62](https://github.com/external-secrets-inc/web-ui/commit/f17ea620187f6f77ab442f291f0e8c25e9736a16))
* add keyvault form ([#299](https://github.com/external-secrets-inc/web-ui/issues/299)) ([9e420a9](https://github.com/external-secrets-inc/web-ui/commit/9e420a95fb3e94afaa2b58fbfb02ebbcb218db71))
* add support to aws parameter store ([#304](https://github.com/external-secrets-inc/web-ui/issues/304)) ([7c42827](https://github.com/external-secrets-inc/web-ui/commit/7c42827468dc0e7ef56501980face795b4aa39de))
* audit tabbed navigation ([#303](https://github.com/external-secrets-inc/web-ui/issues/303)) ([0b0da7d](https://github.com/external-secrets-inc/web-ui/commit/0b0da7d87a39f4841281c3b0c2947b276b78b759))
* refactor audit initial setup ([#302](https://github.com/external-secrets-inc/web-ui/issues/302)) ([7101f4c](https://github.com/external-secrets-inc/web-ui/commit/7101f4c8aff36ef8459d0e795fdd88a8c4bc6490))


### Bug Fixes

* audit fetching behavior ([#301](https://github.com/external-secrets-inc/web-ui/issues/301)) ([d15de8e](https://github.com/external-secrets-inc/web-ui/commit/d15de8edc8b0bb312f39ab6b26cc336d227c4cfe))
* remove connection strings from config ([dd739cd](https://github.com/external-secrets-inc/web-ui/commit/dd739cd54cfce6efd62db60fb19e638afc41ab8f))
* remove connection strings from keyvault config ([#307](https://github.com/external-secrets-inc/web-ui/issues/307)) ([dd739cd](https://github.com/external-secrets-inc/web-ui/commit/dd739cd54cfce6efd62db60fb19e638afc41ab8f))

## [0.12.0](https://github.com/external-secrets-inc/web-ui/compare/v0.11.1...v0.12.0) (2025-03-03)


### Features

* adds gke support ([#292](https://github.com/external-secrets-inc/web-ui/issues/292)) ([eeee1b1](https://github.com/external-secrets-inc/web-ui/commit/eeee1b15026a748d0d35c1155268e7756ad9eb03))

## [0.11.1](https://github.com/external-secrets-inc/web-ui/compare/v0.11.0...v0.11.1) (2025-02-25)


### Bug Fixes

* should use accessor name instead of id ([#286](https://github.com/external-secrets-inc/web-ui/issues/286)) ([2d6e998](https://github.com/external-secrets-inc/web-ui/commit/2d6e9983601319c8c87c1d65b5131b1baf58d56b))

## [0.11.0](https://github.com/external-secrets-inc/web-ui/compare/v0.10.0...v0.11.0) (2025-02-11)


### Features

* :mag: block all crawlers from finding our app ([#275](https://github.com/external-secrets-inc/web-ui/issues/275)) ([977f1e8](https://github.com/external-secrets-inc/web-ui/commit/977f1e86bdd62e8f9a9f2ea156deea13f160b0de))
* ✨ Lineage 🌲 ([#265](https://github.com/external-secrets-inc/web-ui/issues/265)) ([795092f](https://github.com/external-secrets-inc/web-ui/commit/795092f52839fdf57d1efb59b41a3e7a7b3dc3f4))
* Add download secret to individual secret ([#279](https://github.com/external-secrets-inc/web-ui/issues/279)) ([a5a2048](https://github.com/external-secrets-inc/web-ui/commit/a5a204863021e4c3b27ec384541477041f355a15))
* install listener with helm chart ([#270](https://github.com/external-secrets-inc/web-ui/issues/270)) ([bc2624f](https://github.com/external-secrets-inc/web-ui/commit/bc2624fb141775a24bec7c2ef2ef0eec08c0e91c))


### Bug Fixes

* audit and lineage general fixes and responsiveness improvements ([#280](https://github.com/external-secrets-inc/web-ui/issues/280)) ([d85784a](https://github.com/external-secrets-inc/web-ui/commit/d85784a16b57c376a277dfeb7cc8c0e4c1327738))

## [0.10.0](https://github.com/external-secrets-inc/web-ui/compare/v0.9.0...v0.10.0) (2025-01-27)


### Features

* :children_crossing: improve charts intermediate states ([ac0156e](https://github.com/external-secrets-inc/web-ui/commit/ac0156ed5ced6abcd1d0cb915ffc4394ae98d040))
* add table/grid toggle for features  ([#126](https://github.com/external-secrets-inc/web-ui/issues/126)) ([32c9054](https://github.com/external-secrets-inc/web-ui/commit/32c9054436417def7b495c8d0c53dfc826030c2b))
* implemented accordion and accessor logs logic ([#266](https://github.com/external-secrets-inc/web-ui/issues/266)) ([dbaa301](https://github.com/external-secrets-inc/web-ui/commit/dbaa3012000846f6bcefb0cda5b02ddea70c0f5f))
* implemented darkmode toggle button ([#269](https://github.com/external-secrets-inc/web-ui/issues/269)) ([ae5baa2](https://github.com/external-secrets-inc/web-ui/commit/ae5baa251e9b135777ed97c77e3147c338fb32bd))
* improve charts intermediate states styles ([#251](https://github.com/external-secrets-inc/web-ui/issues/251)) ([ac0156e](https://github.com/external-secrets-inc/web-ui/commit/ac0156ed5ced6abcd1d0cb915ffc4394ae98d040))
* Update secrets endpoints ([#247](https://github.com/external-secrets-inc/web-ui/issues/247)) ([36aa532](https://github.com/external-secrets-inc/web-ui/commit/36aa5327a3030743100da1f540893393b656ccfd))


### Bug Fixes

* fixed empty data alert, and centered loading and error cases ([#245](https://github.com/external-secrets-inc/web-ui/issues/245)) ([043d6ee](https://github.com/external-secrets-inc/web-ui/commit/043d6ee3899cd366abe1e7722239630ccfd373d7))
* little fix for handleDefaultApiHttpError ([#259](https://github.com/external-secrets-inc/web-ui/issues/259)) ([356512d](https://github.com/external-secrets-inc/web-ui/commit/356512d53044aaba2ca57294b82e7c13b48f9bfa))
* Secret table mock data and mock return for get secret data function ([#250](https://github.com/external-secrets-inc/web-ui/issues/250)) ([4b8ad86](https://github.com/external-secrets-inc/web-ui/commit/4b8ad86c3489542830c59adb6df4282db02dc219))
* Update filters to new format expected by BE ([#261](https://github.com/external-secrets-inc/web-ui/issues/261)) ([9f52b11](https://github.com/external-secrets-inc/web-ui/commit/9f52b11c8dfd89f9f0af440b2376885c1cb0a25b))

## [0.9.0](https://github.com/external-secrets-inc/web-ui/compare/v0.8.0...v0.9.0) (2025-01-14)


### Features

* :children_crossing: allow clear secret table filters in empty state ([a02cf67](https://github.com/external-secrets-inc/web-ui/commit/a02cf671f212acde2839525f7f6ad35563bdd6be))
* allow clear secret table filters in empty state ([#242](https://github.com/external-secrets-inc/web-ui/issues/242)) ([a02cf67](https://github.com/external-secrets-inc/web-ui/commit/a02cf671f212acde2839525f7f6ad35563bdd6be))
* **date-utils:** add formatDate utility and refactor date formatting… ([#234](https://github.com/external-secrets-inc/web-ui/issues/234)) ([3dcc80a](https://github.com/external-secrets-inc/web-ui/commit/3dcc80aed2c6d6ca60bcc242e36d5c665d284168))
* use stacked area chart for audit timelines  ([#243](https://github.com/external-secrets-inc/web-ui/issues/243)) ([cc706db](https://github.com/external-secrets-inc/web-ui/commit/cc706dbb9dc0bedb553c37069ce7fa0ff1a74cee))


### Bug Fixes

* :bug: fix auto theme switch based on os theme ([b53b351](https://github.com/external-secrets-inc/web-ui/commit/b53b3511ea23f29e72e57e417d63e477caa0f35e))
* auto theme switch based on OS theme ([#240](https://github.com/external-secrets-inc/web-ui/issues/240)) ([b53b351](https://github.com/external-secrets-inc/web-ui/commit/b53b3511ea23f29e72e57e417d63e477caa0f35e))
* default scrollbar styles and color theme ([#239](https://github.com/external-secrets-inc/web-ui/issues/239)) ([dcabbf9](https://github.com/external-secrets-inc/web-ui/commit/dcabbf9ba9403397a4d30013fb0dedd6008a9cdb))
* filter dialog data management ([#237](https://github.com/external-secrets-inc/web-ui/issues/237)) ([47c18d3](https://github.com/external-secrets-inc/web-ui/commit/47c18d3b8fa8cb76437c881c0c5c4b9546caebf2))
* make multi select consistent with select component ([#241](https://github.com/external-secrets-inc/web-ui/issues/241)) ([11f58be](https://github.com/external-secrets-inc/web-ui/commit/11f58befe9806083a37810ff102bf4b1389850a8))

## [0.8.0](https://github.com/external-secrets-inc/web-ui/compare/v0.7.0...v0.8.0) (2025-01-12)


### Features

* :sparkles: allow using different keys for row id in dataProvider and fix on audit ([883a9be](https://github.com/external-secrets-inc/web-ui/commit/883a9be3d938baa8dcc8037cb70f7ac66aef9a20))
* add audit paywall by checking feature name ([#171](https://github.com/external-secrets-inc/web-ui/issues/171)) ([7b2daf5](https://github.com/external-secrets-inc/web-ui/commit/7b2daf584f8b5d382fe4a9212a4c34878712f802))
* add audit timeline charts ([#135](https://github.com/external-secrets-inc/web-ui/issues/135)) ([276ae12](https://github.com/external-secrets-inc/web-ui/commit/276ae12e1519d0e4a00bb60dbbf6ac795ba279d4))
* add audit to dev ([#159](https://github.com/external-secrets-inc/web-ui/issues/159)) ([69c1f73](https://github.com/external-secrets-inc/web-ui/commit/69c1f732b4918376cfb6f18549db69319d682a48))
* add barebones mock toggle for testing audit endpoints ([#179](https://github.com/external-secrets-inc/web-ui/issues/179)) ([a7aa663](https://github.com/external-secrets-inc/web-ui/commit/a7aa663054fa0d01e32c5aec0788fa2707053336))
* add custom CodeTextarea UI component and use on policy dialog ([#219](https://github.com/external-secrets-inc/web-ui/issues/219)) ([eb862b7](https://github.com/external-secrets-inc/web-ui/commit/eb862b716905a96d932721c99e320f4fdfc08c2d))
* Add export button for secrets-table ([#230](https://github.com/external-secrets-inc/web-ui/issues/230)) ([30853cb](https://github.com/external-secrets-inc/web-ui/commit/30853cbf3a59eaa65749ba02bd6f44fe8e62667e))
* Add filter by text ([#214](https://github.com/external-secrets-inc/web-ui/issues/214)) ([9b3afc3](https://github.com/external-secrets-inc/web-ui/commit/9b3afc34f96fe4757aa065c54de5be1f1a4a6c44))
* add individual secrets details dialog ([#203](https://github.com/external-secrets-inc/web-ui/issues/203)) ([39ba67b](https://github.com/external-secrets-inc/web-ui/commit/39ba67bb80967020da7b09318b3d5de0ce7dd9ab))
* add provider identifier into form ([#189](https://github.com/external-secrets-inc/web-ui/issues/189)) ([d51d34b](https://github.com/external-secrets-inc/web-ui/commit/d51d34bac7bb956507eefee592309a2bf1ebb509))
* add vault form ([#176](https://github.com/external-secrets-inc/web-ui/issues/176)) ([f219129](https://github.com/external-secrets-inc/web-ui/commit/f21912994ca81996f1fe266a8aa9160755017f00))
* allow backend switching from axiosInstance (for poc-audit) ([#154](https://github.com/external-secrets-inc/web-ui/issues/154)) ([00876df](https://github.com/external-secrets-inc/web-ui/commit/00876dfc166f776180509eef0bd6976500cef8ea))
* allow using different keys for row id in dataProvider ([#191](https://github.com/external-secrets-inc/web-ui/issues/191)) ([883a9be](https://github.com/external-secrets-inc/web-ui/commit/883a9be3d938baa8dcc8037cb70f7ac66aef9a20))
* audit loading subscription and subscription context ([#212](https://github.com/external-secrets-inc/web-ui/issues/212)) ([d67c462](https://github.com/external-secrets-inc/web-ui/commit/d67c46274a28a87dbb6a17d0722c1af88ecc3bdc))
* Audit provider table and Add provider dialog ([#144](https://github.com/external-secrets-inc/web-ui/issues/144)) ([5d5a02b](https://github.com/external-secrets-inc/web-ui/commit/5d5a02b10064e570595b501ecb39937a7986c3ae))
* chart time unit ([#213](https://github.com/external-secrets-inc/web-ui/issues/213)) ([b22c8c3](https://github.com/external-secrets-inc/web-ui/commit/b22c8c3fe97c596bf0fec89f13e338c02bd97c7f))
* charts integration ([#160](https://github.com/external-secrets-inc/web-ui/issues/160)) ([397032b](https://github.com/external-secrets-inc/web-ui/commit/397032bfa04718effc47d47a87706fa1c425820e))
* create and integrate policy assignments ([#170](https://github.com/external-secrets-inc/web-ui/issues/170)) ([80c0b08](https://github.com/external-secrets-inc/web-ui/commit/80c0b087b375cbd127140673615e414dfaa398a6))
* create listener on tenant, getting install methods ([#153](https://github.com/external-secrets-inc/web-ui/issues/153)) ([8c4f4bc](https://github.com/external-secrets-inc/web-ui/commit/8c4f4bccf48afefa8e4e2850925a482f317dacbb))
* expiry subscription banner ([#147](https://github.com/external-secrets-inc/web-ui/issues/147)) ([18f4f07](https://github.com/external-secrets-inc/web-ui/commit/18f4f0715c342dfd1c93dc793c18cc2afbafd4a8))
* implement policy screen ([#155](https://github.com/external-secrets-inc/web-ui/issues/155)) ([b7e319a](https://github.com/external-secrets-inc/web-ui/commit/b7e319a1cffcc1c9823d15d41ba16f1ce53591f9))
* improve copy for last accessors ([#221](https://github.com/external-secrets-inc/web-ui/issues/221)) ([cbcb138](https://github.com/external-secrets-inc/web-ui/commit/cbcb138557da3aac1ffd05a88e29dd8f5edb5261))


### Bug Fixes

* :bug: normalized response errors for different backends ([#168](https://github.com/external-secrets-inc/web-ui/issues/168)) ([12241cd](https://github.com/external-secrets-inc/web-ui/commit/12241cdb1697649b2ebb98b27e5fbf02c8578316))
* :package: fix packages vulnerabilities ([a3c4553](https://github.com/external-secrets-inc/web-ui/commit/a3c4553491b6eae1da9c82b0e1ef26de075d7d47))
* adds audit backend url ([#166](https://github.com/external-secrets-inc/web-ui/issues/166)) ([2fc5c55](https://github.com/external-secrets-inc/web-ui/commit/2fc5c553dffed1455c4027f9c61896957643a16d))
* Audit listener creation ([#165](https://github.com/external-secrets-inc/web-ui/issues/165)) ([248d1f1](https://github.com/external-secrets-inc/web-ui/commit/248d1f1090962c4a2dfe78c08a3100a4995571c3))
* auto approve small prs ([#181](https://github.com/external-secrets-inc/web-ui/issues/181)) ([aa69fa1](https://github.com/external-secrets-inc/web-ui/commit/aa69fa1569d4070190517d04bc7415279df2d6de))
* auto fill add provider form with default backend values ([#190](https://github.com/external-secrets-inc/web-ui/issues/190)) ([3480b16](https://github.com/external-secrets-inc/web-ui/commit/3480b16aa2c810a8cf1779d9626106cf6230b746))
* change assing policies endpoints ([#188](https://github.com/external-secrets-inc/web-ui/issues/188)) ([93df39f](https://github.com/external-secrets-inc/web-ui/commit/93df39f9f555e29c0502c2232e3e6971e1a8aa90))
* dataProvider infinite loop ([#186](https://github.com/external-secrets-inc/web-ui/issues/186)) ([439f306](https://github.com/external-secrets-inc/web-ui/commit/439f3066f957b9a3138e39d50ecaf24a4703aa3a))
* Fix typo on Audit Secret Table providersNames ([#210](https://github.com/external-secrets-inc/web-ui/issues/210)) ([d5084e8](https://github.com/external-secrets-inc/web-ui/commit/d5084e8a65c3ea880003f05d5c41caa9e6de56b7))
* flicker audit wrapper ([#211](https://github.com/external-secrets-inc/web-ui/issues/211)) ([2e69084](https://github.com/external-secrets-inc/web-ui/commit/2e690845e373155a8857f3ae8d00dada6ed02777))
* general url redirect ([#152](https://github.com/external-secrets-inc/web-ui/issues/152)) ([b48e600](https://github.com/external-secrets-inc/web-ui/commit/b48e60061f41085d12cb45ba6659170cb3aae9ee))
* GetAuditProblemStats call on AuditChartProblems ([#185](https://github.com/external-secrets-inc/web-ui/issues/185)) ([eb9ba12](https://github.com/external-secrets-inc/web-ui/commit/eb9ba127373aeb4f63a0f181509ecdc2d9abc98f))
* little fix on getValidateRule ([#202](https://github.com/external-secrets-inc/web-ui/issues/202)) ([fd8cdde](https://github.com/external-secrets-inc/web-ui/commit/fd8cdde1f2fc88b6e4f02f1d5f66dbe8cef19555))
* packages vulnerabilities ([#146](https://github.com/external-secrets-inc/web-ui/issues/146)) ([a3c4553](https://github.com/external-secrets-inc/web-ui/commit/a3c4553491b6eae1da9c82b0e1ef26de075d7d47))
* Policy validation error displayed message ([#229](https://github.com/external-secrets-inc/web-ui/issues/229)) ([54697dc](https://github.com/external-secrets-inc/web-ui/commit/54697dcb1d2a8a7bb95895d43a8fb1db9c416c4d))
* providers endpoints ([#167](https://github.com/external-secrets-inc/web-ui/issues/167)) ([f60980f](https://github.com/external-secrets-inc/web-ui/commit/f60980fbce3cad27a1980c7d031eb93260f52696))
* quickfix assign and unassign policies backend call ([#180](https://github.com/external-secrets-inc/web-ui/issues/180)) ([09caac1](https://github.com/external-secrets-inc/web-ui/commit/09caac1964e795cd5c0e4b3bc3ffd2037bad48fd))
* re-rendering of other tables when secret table refetches ([#208](https://github.com/external-secrets-inc/web-ui/issues/208)) ([1f187aa](https://github.com/external-secrets-inc/web-ui/commit/1f187aac8ff814ea61dcd2a2342dfc79c8cf73e0))
* Remove mock secrets table and other minor fix ([#173](https://github.com/external-secrets-inc/web-ui/issues/173)) ([752d760](https://github.com/external-secrets-inc/web-ui/commit/752d760631fb4b4f11b230e5667915c244eb8280))
* secret table order ([#207](https://github.com/external-secrets-inc/web-ui/issues/207)) ([889b5cf](https://github.com/external-secrets-inc/web-ui/commit/889b5cf48df3631bfe5c1de798f4738c8a3479bc))
* secrets table filter ([#204](https://github.com/external-secrets-inc/web-ui/issues/204)) ([8141f95](https://github.com/external-secrets-inc/web-ui/commit/8141f955acf9299d24275f7c1ef4cddf4fd5f086))
* some fixes for policies screen ([#197](https://github.com/external-secrets-inc/web-ui/issues/197)) ([9d5765f](https://github.com/external-secrets-inc/web-ui/commit/9d5765f8eda7aaa5519a4393aa61f9c4d35e37b8))
* token bash file ([#177](https://github.com/external-secrets-inc/web-ui/issues/177)) ([d9a7a90](https://github.com/external-secrets-inc/web-ui/commit/d9a7a9031526c03ba7e5e784fdd950b1579c7aac))
* Update secret table interface ([#206](https://github.com/external-secrets-inc/web-ui/issues/206)) ([dd837eb](https://github.com/external-secrets-inc/web-ui/commit/dd837eb5830dd9d57a04254e2e43d1b5b7ea4c79))

## [0.7.0](https://github.com/external-secrets-inc/web-ui/compare/v0.6.1...v0.7.0) (2024-12-06)


### Features

* add audit charts ([#130](https://github.com/external-secrets-inc/web-ui/issues/130)) ([732307f](https://github.com/external-secrets-inc/web-ui/commit/732307feb956aab54c4f985b3b1ecdb170732641))
* add DataProvider with DataTable and DataGrid UI components ([#129](https://github.com/external-secrets-inc/web-ui/issues/129)) ([ab7e5b9](https://github.com/external-secrets-inc/web-ui/commit/ab7e5b9b74930fab09bc33aab11d613b783dc3c7))
* add shadcn chart component ([#131](https://github.com/external-secrets-inc/web-ui/issues/131)) ([2d46d32](https://github.com/external-secrets-inc/web-ui/commit/2d46d328211d938b2e750639203388eb70bafe2d))
* add shadcn/ui table component ([#132](https://github.com/external-secrets-inc/web-ui/issues/132)) ([9b261e5](https://github.com/external-secrets-inc/web-ui/commit/9b261e5dbaedd3a5a57b4a2ee91caa9b41185e00))
* add toggle and toggle-group components ([#128](https://github.com/external-secrets-inc/web-ui/issues/128)) ([6e44eef](https://github.com/external-secrets-inc/web-ui/commit/6e44eef32b575bbebd5ce4ef21e9a35c05039652))
* adds tenant id to organization setting ([#149](https://github.com/external-secrets-inc/web-ui/issues/149)) ([17aa3c7](https://github.com/external-secrets-inc/web-ui/commit/17aa3c72bd291921eef1cbd9f651e180d9f1b756))
* audit screen ([#127](https://github.com/external-secrets-inc/web-ui/issues/127)) ([9373497](https://github.com/external-secrets-inc/web-ui/commit/9373497a120d257b5fa8ef81cb67e8b35eeeb703))
* audit with data table component ([#133](https://github.com/external-secrets-inc/web-ui/issues/133)) ([239d2ce](https://github.com/external-secrets-inc/web-ui/commit/239d2ce2c455641c689aafcd3d63f811c9095c2c))
* filter files for label gha ([335fdfc](https://github.com/external-secrets-inc/web-ui/commit/335fdfc52d0f57455900889dadb507e6ad528c2b))
* filter section ([#134](https://github.com/external-secrets-inc/web-ui/issues/134)) ([f2f2b03](https://github.com/external-secrets-inc/web-ui/commit/f2f2b0384c25ae1d123a6636235d46a218dd6d10))
* install listener components ([#125](https://github.com/external-secrets-inc/web-ui/issues/125)) ([94c2b73](https://github.com/external-secrets-inc/web-ui/commit/94c2b739ada24473b62ba21b57c4f18277df1883))
* tanstack table features in current feature collections ([#113](https://github.com/external-secrets-inc/web-ui/issues/113)) ([8921315](https://github.com/external-secrets-inc/web-ui/commit/8921315d60b489f7e5012393b20aeb827b7fdeef))


### Bug Fixes

* label ([f79d041](https://github.com/external-secrets-inc/web-ui/commit/f79d04106261d4e300043012a2f11779ef7a0414))
* lint action ([#145](https://github.com/external-secrets-inc/web-ui/issues/145)) ([965b3f0](https://github.com/external-secrets-inc/web-ui/commit/965b3f0ef37a027f0d32a218b242ce4aa106fe55))

## [0.6.1](https://github.com/external-secrets-inc/web-ui/compare/v0.6.0...v0.6.1) (2024-11-04)


### Bug Fixes

* Add a 20 seconds refetch interval for agents and rotator query ([#109](https://github.com/external-secrets-inc/web-ui/issues/109)) ([3698469](https://github.com/external-secrets-inc/web-ui/commit/36984698bf4422353034b754ba0df6ace26268e4))

## [0.6.0](https://github.com/external-secrets-inc/web-ui/compare/v0.5.0...v0.6.0) (2024-10-25)


### Features

* async rotator page ([#98](https://github.com/external-secrets-inc/web-ui/issues/98)) ([3f71d85](https://github.com/external-secrets-inc/web-ui/commit/3f71d8535736e207bf398ebc3abf71649f8b3048))
* creating icon warning for expired subscriptions ([#106](https://github.com/external-secrets-inc/web-ui/issues/106)) ([88f4ffe](https://github.com/external-secrets-inc/web-ui/commit/88f4ffe1a79ddfae2609a73400d6074f413ab634))
* update agent segment events to be more generic ([#100](https://github.com/external-secrets-inc/web-ui/issues/100)) ([f069a06](https://github.com/external-secrets-inc/web-ui/commit/f069a0636dfb02aa4fc93aca550454edfdb4c4d7))
* zendesk support ([#97](https://github.com/external-secrets-inc/web-ui/issues/97)) ([09f4855](https://github.com/external-secrets-inc/web-ui/commit/09f4855483f92d75aa12fa9d3a7e025dfa8af9c0))


### Bug Fixes

* 📦 fix [#104](https://github.com/external-secrets-inc/web-ui/issues/104) package-lock issues and website_url ([#105](https://github.com/external-secrets-inc/web-ui/issues/105)) ([7e51c8a](https://github.com/external-secrets-inc/web-ui/commit/7e51c8a2c58d0f939ff1a4e129a7e0ec7c311310))
* move unnecessary prod dependencies back to devDependencies ([#104](https://github.com/external-secrets-inc/web-ui/issues/104)) ([1228455](https://github.com/external-secrets-inc/web-ui/commit/1228455c81d4863a1842a9f0b92be4fcd0729491))

## [0.5.0](https://github.com/external-secrets-inc/web-ui/compare/v0.4.1...v0.5.0) (2024-10-17)


### Features

* improve agent card and modal ux ([#94](https://github.com/external-secrets-inc/web-ui/issues/94)) ([880ab96](https://github.com/external-secrets-inc/web-ui/commit/880ab96c32f086a392960e2c9f4fddc30f5cba30))


### Bug Fixes

* :bug: always load segment to avoid `undefined` when running its methods ([94fb470](https://github.com/external-secrets-inc/web-ui/commit/94fb470131ece87010e88874b6ca1d787a2bc991))

## [0.4.1](https://github.com/external-secrets-inc/web-ui/compare/v0.4.0...v0.4.1) (2024-10-14)


### Bug Fixes

* :bug: fix undefined website url on auth pages ([3a8341c](https://github.com/external-secrets-inc/web-ui/commit/3a8341c8b95e2ed1a10ce15b9e930d7f4af3cb2b))
* :hammer: update cookieyes script for new account ([45a365f](https://github.com/external-secrets-inc/web-ui/commit/45a365fc9fbdffc9f416c7581ae9af8f883aa6d3))

## [0.4.0](https://github.com/external-secrets-inc/web-ui/compare/v0.3.0...v0.4.0) (2024-10-14)


### Features

* :sparkles: add cookieyes banner script ([ea19662](https://github.com/external-secrets-inc/web-ui/commit/ea196629dc6a5bb5966b4bf8d3f435101d8b31fc))


### Bug Fixes

* clipboardable apply command ([#88](https://github.com/external-secrets-inc/web-ui/issues/88)) ([9ae4b8b](https://github.com/external-secrets-inc/web-ui/commit/9ae4b8b6dd297e817b81acd9296b0e4aa85c6c3e))

## [0.3.0](https://github.com/external-secrets-inc/web-ui/compare/v0.2.4...v0.3.0) (2024-10-11)


### Features

* allow deletion of tenant through the UI ([#73](https://github.com/external-secrets-inc/web-ui/issues/73)) ([400ab86](https://github.com/external-secrets-inc/web-ui/commit/400ab869055a622755b8e8331a1d893ebafecd33))
* auth qol improvements ([#83](https://github.com/external-secrets-inc/web-ui/issues/83)) ([644238e](https://github.com/external-secrets-inc/web-ui/commit/644238ed6ea2e4517ab6761db736adf5b06a2482))


### Bug Fixes

* :bug: quickfix signup track event spreading string data ([654d29f](https://github.com/external-secrets-inc/web-ui/commit/654d29f579d6ceb4d8de443ead2b1c2980e257ac))
* no cache on index.html ([#85](https://github.com/external-secrets-inc/web-ui/issues/85)) ([f3fb51a](https://github.com/external-secrets-inc/web-ui/commit/f3fb51a221aecc0405df5eb12e0178df134845e3))
* position of meta ([d51e8ef](https://github.com/external-secrets-inc/web-ui/commit/d51e8efed24dabeb7afb457d693ae2f25c05cdb5))

## [0.2.4](https://github.com/external-secrets-inc/web-ui/compare/v0.2.3...v0.2.4) (2024-10-07)


### Bug Fixes

* :bug: quickfix login retry attempts after signup ([60bb754](https://github.com/external-secrets-inc/web-ui/commit/60bb75481a721c45ec264b57736fef759171bccd))

## [0.2.3](https://github.com/external-secrets-inc/web-ui/compare/v0.2.2...v0.2.3) (2024-10-07)


### Bug Fixes

* :bug: make profile email in settings read-only ([#71](https://github.com/external-secrets-inc/web-ui/issues/71)) ([67daf7a](https://github.com/external-secrets-inc/web-ui/commit/67daf7a6ad9d193eb3c359e38f0098ab8e9e1df1))

## [0.2.2](https://github.com/external-secrets-inc/web-ui/compare/v0.2.1...v0.2.2) (2024-10-07)


### Bug Fixes

* :bug: quickfix login not rethrowing errors ([c88bb96](https://github.com/external-secrets-inc/web-ui/commit/c88bb9683f9172894f8f097324b327c1c96a37ee))
* docs on prod ([#69](https://github.com/external-secrets-inc/web-ui/issues/69)) ([33119b7](https://github.com/external-secrets-inc/web-ui/commit/33119b77682cb9998ec95744e475a99a3c2a8456))

## [0.2.1](https://github.com/external-secrets-inc/web-ui/compare/v0.2.0...v0.2.1) (2024-10-07)


### Bug Fixes

* dependencies for prod ([0113b01](https://github.com/external-secrets-inc/web-ui/commit/0113b01b70fb30e9b5e0b490b9431f00fc63d5c7))
* no devDependencies ([98a13de](https://github.com/external-secrets-inc/web-ui/commit/98a13de023c36be9a8bf08eb3cfbd0a57b3cd8ff))

## [0.2.0](https://github.com/external-secrets-inc/web-ui/compare/v0.1.1...v0.2.0) (2024-10-05)


### Features

* :chart_with_upwards_trend: track agent creation ([6d6d41d](https://github.com/external-secrets-inc/web-ui/commit/6d6d41d43f1339cf314991998a6d23adc58005fe))
* :chart_with_upwards_trend: track agent deletion ([015ca7c](https://github.com/external-secrets-inc/web-ui/commit/015ca7c55612e0e892d8c29c45f2fce864400a71))
* :chart_with_upwards_trend: track agent dialog actions ([1a61aef](https://github.com/external-secrets-inc/web-ui/commit/1a61aefa35c93da34e931e8ec2962051591d3cd5))
* :chart_with_upwards_trend: track login/signup steps and completion ([a4819f3](https://github.com/external-secrets-inc/web-ui/commit/a4819f309d15b2546d5e627ca96ac7a7e7ccc53d))
* :chart_with_upwards_trend: track settings navigation and changes ([cd7a3b3](https://github.com/external-secrets-inc/web-ui/commit/cd7a3b33437072b65497bc7c180c9456a97a403a))
* :chart_with_upwards_trend: track sign out ([3f2264e](https://github.com/external-secrets-inc/web-ui/commit/3f2264e49f4895f40610db088ed0b2de2e411c6b))
* :lipstick: Add Shadcn ScrollArea ([31cabb3](https://github.com/external-secrets-inc/web-ui/commit/31cabb364d56e903fa8cc82cc8be278d340cb066))
* :lipstick: Add Shadcn Sheet ([4088174](https://github.com/external-secrets-inc/web-ui/commit/408817487e3d00a2e9737a48872b1637377ef9cc))
* :lipstick: Highlight navigation links based on current route ([29b65e7](https://github.com/external-secrets-inc/web-ui/commit/29b65e7b2547ef9161a9675858d413e9ca7a6436))
* :sparkles: Add mobile menu with docs external link ([03a320e](https://github.com/external-secrets-inc/web-ui/commit/03a320e298a1663c559141af54dde5cc1da28f8e))
* :sparkles: Add Shadcn and Radix components necessary for mobile menu ([e62451f](https://github.com/external-secrets-inc/web-ui/commit/e62451f15a16ecd77df7e31d70c640ecd5339aa0))
* :sparkles: allow signing up again during verification proces ([654e389](https://github.com/external-secrets-inc/web-ui/commit/654e3894d19b488a93cd697963e710aa1d0f3a38))
* :sparkles: Identify user on login for Segment ([82df22b](https://github.com/external-secrets-inc/web-ui/commit/82df22b3832eb430140a906bc3bafb0dfdb676e7))
* :sparkles: Implement segment with router navigation tracking ([257c1f8](https://github.com/external-secrets-inc/web-ui/commit/257c1f8db687149d3b73326abcc84253985c2887))
* add RequireActiveUser ([#54](https://github.com/external-secrets-inc/web-ui/issues/54)) ([1e70313](https://github.com/external-secrets-inc/web-ui/commit/1e7031391d426694191451f608e1cd56dd236668))
* allow /docs to go to mintlify ([ca52de7](https://github.com/external-secrets-inc/web-ui/commit/ca52de7940af2e374f33b7d3e24f07c878218e6d))


### Bug Fixes

* :bug: add missing code from merge conflict ([f397702](https://github.com/external-secrets-inc/web-ui/commit/f397702722a3423bbada7a638863622386f5caf7))
* :bug: Fix accessibility warnings ([affa3eb](https://github.com/external-secrets-inc/web-ui/commit/affa3ebea02e1519fb5ecdc91239213463a28fc8))
* :bug: Fix page loads tracking ([168ec25](https://github.com/external-secrets-inc/web-ui/commit/168ec250dac0c1580dd79a46da19c823bf3029ea))
* :bug: fix settings form abstraction and add tracking to it ([27a26c2](https://github.com/external-secrets-inc/web-ui/commit/27a26c209dc44f82813878ff9153e671e6df236a))
* :bug: fix settings tabs overflow on narrower screens ([7f4633e](https://github.com/external-secrets-inc/web-ui/commit/7f4633eee7a50f95ac408c37df33873c69d1b6c2))
* :bug: fix unresponsive app after opening dialog from dropdown ([1758243](https://github.com/external-secrets-inc/web-ui/commit/1758243591e57c2712abb7ff1fe31291e36e137b))
* :lipstick: Add back ghost style to menu icon ([da33375](https://github.com/external-secrets-inc/web-ui/commit/da3337587aa6ef87cf376287b7c2b7a729df5417))
* :lipstick: Fix main block padding ([716a145](https://github.com/external-secrets-inc/web-ui/commit/716a145737eda8edba5411ebcb664094d65e34fd))
* '/docs/' and '/docs' must also work ([b7e1b5e](https://github.com/external-secrets-inc/web-ui/commit/b7e1b5ec0c5250d4bda620e40ba82eaa18c5e3c2))
* build for docs ([5c98955](https://github.com/external-secrets-inc/web-ui/commit/5c98955ff1f4e5111653de55e7f9f3523af86e7b))
* changing error msg ([6c7cfba](https://github.com/external-secrets-inc/web-ui/commit/6c7cfba27fbac182dca660321039554cb1ae03db))
* defaults ([ab74c8a](https://github.com/external-secrets-inc/web-ui/commit/ab74c8a0af35b4d44312c936219ca420d15a9caa))
* docs/docs bug ([2b8b403](https://github.com/external-secrets-inc/web-ui/commit/2b8b4036d79cebda261e688c2f40ccd9a18e3a69))
* fixes redirect to properly load docs ([f946fd4](https://github.com/external-secrets-inc/web-ui/commit/f946fd49d328d3662e5db3b2ab6c7771623f8dc5))
* no comments ([e517907](https://github.com/external-secrets-inc/web-ui/commit/e517907f5f242b09bf0d569f83673c1e0e1f6131))
* ref organization on failure ([b72307e](https://github.com/external-secrets-inc/web-ui/commit/b72307e63f7ca50994ea5bb502ffea1fd77b2555))
* remove comment ([defced5](https://github.com/external-secrets-inc/web-ui/commit/defced5f301452d37fd1be3b1095b826622c4c77))
* update org success msg ([a541794](https://github.com/external-secrets-inc/web-ui/commit/a5417946373a33bdd5f50b9e8b803fcde0688c33))
* verifies token before forwarding to /docs ([eefb467](https://github.com/external-secrets-inc/web-ui/commit/eefb46753fa247d4388f38e4194a4559872d672f))
* webui port ([799c074](https://github.com/external-secrets-inc/web-ui/commit/799c0744922d55762f440986d2aa1d816628b027))

## [0.1.1](https://github.com/external-secrets-inc/web-ui/compare/v0.1.0...v0.1.1) (2024-09-23)


### Bug Fixes

* prod tag ([b6944a9](https://github.com/external-secrets-inc/web-ui/commit/b6944a9809dfc2d8fbdc7d7adbba77f292b5169e))

## [0.1.0](https://github.com/external-secrets-inc/web-ui/compare/0.0.0...v0.1.0) (2024-09-23)


### Features

* build docker image and helm chart for pod ([583e128](https://github.com/external-secrets-inc/web-ui/commit/583e128a21814ed8673cd3626e388ed0d2c361a6))
* bump ci ([a9d44f8](https://github.com/external-secrets-inc/web-ui/commit/a9d44f8bd1d8ac9c7a4b0b06ea87f2771a68cfd0))
* ci trigger k8s-flux ([f4e290c](https://github.com/external-secrets-inc/web-ui/commit/f4e290c29c596f8ee61c5407a50655cbf1abb97c))
* conventional commits ([71b7b6f](https://github.com/external-secrets-inc/web-ui/commit/71b7b6f9997e505c45151374c863f4edede685d1))
* deploy to dev and prod ([5aaf8d6](https://github.com/external-secrets-inc/web-ui/commit/5aaf8d6d761cb583981df064c666e2db1cab0edb))
* merge branch 'main' into gc/feat/release-please ([42b980f](https://github.com/external-secrets-inc/web-ui/commit/42b980fb23b9a778d0daf20f73d4ad9e5061e3d7))
* release please setup ([71b7b6f](https://github.com/external-secrets-inc/web-ui/commit/71b7b6f9997e505c45151374c863f4edede685d1))


### Bug Fixes

* add Makefile ([36f07fd](https://github.com/external-secrets-inc/web-ui/commit/36f07fd942e5ef3d9873659f95e3263e89b57c45))
* add vite api env var to build time ([93ceb06](https://github.com/external-secrets-inc/web-ui/commit/93ceb06fa1ae0c73aa7e1bd9dbf9ac141a57f9c0))
* adds tenant manager to build ([88c0bd9](https://github.com/external-secrets-inc/web-ui/commit/88c0bd98f470cf28af608daa9bf237b0573054e4))
* chart name ([e427b9e](https://github.com/external-secrets-inc/web-ui/commit/e427b9e3eb678f60708244a5d6b4c2f841c62111))
* chart repo ([c0312f8](https://github.com/external-secrets-inc/web-ui/commit/c0312f8ad12b79f684290c1a75bcf7254a664a9f))
* no conventional-commit for now ([f4e290c](https://github.com/external-secrets-inc/web-ui/commit/f4e290c29c596f8ee61c5407a50655cbf1abb97c))
* still wip ([40a8a30](https://github.com/external-secrets-inc/web-ui/commit/40a8a307294f51853bd04e0a29e6ceb3b7def508))
* syntax ([cc2df58](https://github.com/external-secrets-inc/web-ui/commit/cc2df58891f25b8acaeec362539459c6bd0fc8b5))
* token scoped to k8s-flux repository ([d8608ef](https://github.com/external-secrets-inc/web-ui/commit/d8608ef02b66da59461581d3c2caababd06bc8d9))
* typo ([2bb6796](https://github.com/external-secrets-inc/web-ui/commit/2bb679687104f061a978408b0cc686a99ff58800))
* typo ([6985995](https://github.com/external-secrets-inc/web-ui/commit/6985995faf8dda5fc1f078092cbb539d900b1f95))
